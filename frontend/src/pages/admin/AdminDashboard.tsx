import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCard } from "@/components/admin/StatsCard";
import { VisitsChart } from "@/components/admin/VisitsChart";
import { RecentVisitsTable } from "@/components/admin/RecentVisitsTable";
import {
  Users,
  MapPin,
  TrendingUp,
  UserCheck,
  Stethoscope,
  BarChart3,
} from "lucide-react";
import { fetchAdminDashboard, fetchAdminAnalytics } from "@/lib/api";
import { AddDoctorModal } from "@/components/admin/AddDoctorModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminDashboard() {
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<
    "day" | "week" | "month"
  >("day");

  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminDashboard,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["admin-analytics", analyticsPeriod],
    queryFn: () => fetchAdminAnalytics(analyticsPeriod),
  });

  const stats = useMemo(() => {
    const summary = analyticsData?.summary || {};

    return [
      {
        label: "Total Visits",
        value: String(summary.total_visits ?? "--"),
        icon: MapPin,
        color: "primary" as const,
      },
      {
        label: "Active MRs",
        value: `${summary.active_mrs ?? "--"}/${summary.total_mrs ?? "--"}`,
        icon: Users,
        color: "secondary" as const,
      },
      {
        label: "Doctor Visits",
        value: String(summary.total_doctor_visits ?? "--"),
        icon: Stethoscope,
        color: "primary" as const,
      },
      {
        label: "Shop Visits",
        value: String(summary.total_shop_visits ?? "--"),
        icon: TrendingUp,
        color: "secondary" as const,
      },
    ];
  }, [analyticsData?.summary]);

  const chartData = useMemo(
    () =>
      (analyticsData?.daily_trends || []).map((item) => ({
        name: new Date(item.date).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        }),
        visits: item.total,
        doctors: item.doctor_visits,
        shops: item.shop_visits,
      })),
    [analyticsData?.daily_trends]
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time MR tracking and analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Select
              value={analyticsPeriod}
              onValueChange={(val: any) => setAnalyticsPeriod(val)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              onClick={() => setIsAddDoctorOpen(true)}
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              Add Doctor
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VisitsChart data={chartData} />
          </div>
          <div>
            <RecentVisitsTable visits={data?.recent_visits || []} />
          </div>
        </div>

        {/* Top Doctors */}
        {analyticsData?.top_doctors && analyticsData.top_doctors.length > 0 && (
          <div className="pharma-card overflow-hidden">
            <div className="p-4 lg:p-6 border-b border-border flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">
                Top Visited Doctors
              </h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead className="text-right">Total Visits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyticsData.top_doctors.map((doctor) => (
                    <TableRow key={doctor.doctor_name__id}>
                      <TableCell className="font-medium">
                        {doctor.doctor_name__name}
                      </TableCell>
                      <TableCell>
                        {doctor.doctor_name__specialization}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {doctor.total_visits}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* MR Performance */}
        {analyticsData?.mr_performance &&
          analyticsData.mr_performance.length > 0 && (
            <div className="pharma-card overflow-hidden">
              <div className="p-4 lg:p-6 border-b border-border flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                <h3 className="font-semibold text-foreground">
                  MR Performance
                </h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>MR Name</TableHead>
                      <TableHead className="text-center">
                        Doctor Visits
                      </TableHead>
                      <TableHead className="text-center">Shop Visits</TableHead>
                      <TableHead className="text-center">
                        Total Visits
                      </TableHead>
                      <TableHead className="text-center">Task-Based</TableHead>
                      <TableHead className="text-center">Self Visits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.mr_performance.map((mr) => (
                      <TableRow key={mr.mr_id}>
                        <TableCell className="font-medium">
                          {mr.mr_name}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {mr.doctor_visits}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {mr.shop_visits}
                        </TableCell>
                        <TableCell className="text-center text-sm font-semibold">
                          {mr.total_visits}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          <span className="inline-block px-2 py-1 rounded bg-blue-500/10 text-blue-600 text-xs font-medium">
                            {mr.task_based_visits}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          <span className="inline-block px-2 py-1 rounded bg-gray-500/10 text-gray-600 text-xs font-medium">
                            {mr.self_visits}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

        <AddDoctorModal
          open={isAddDoctorOpen}
          onClose={() => setIsAddDoctorOpen(false)}
          onDoctorCreated={() => undefined}
        />
      </div>
    </AdminLayout>
  );
}
