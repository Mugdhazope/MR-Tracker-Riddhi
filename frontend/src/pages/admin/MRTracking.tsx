import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Download,
  MapPin,
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  Store,
  Stethoscope,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VisitMapModal } from "@/components/admin/VisitMapModal";
import {
  AssignTaskModal,
  AssignedTask,
} from "@/components/admin/AssignTaskModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminDashboard,
  fetchDoctors,
  fetchMRs,
  fetchTasks,
  getStoredUser,
} from "@/lib/api";
import { AddDoctorModal } from "@/components/admin/AddDoctorModal";

export default function MRTracking() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerritory, setSelectedTerritory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedVisit, setSelectedVisit] = useState<{
    id: number;
    time: string;
    mr: string;
    doctor: string;
    notes: string;
    lat?: number | null;
    lng?: number | null;
    type: "doctor" | "shop";
  } | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);

  const user = useMemo(() => getStoredUser(), []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "admin") {
      navigate("/mr/dashboard");
    }
  }, [navigate, user]);

  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminDashboard,
  });

  const doctorsQuery = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctors,
  });

  const mrsQuery = useQuery({
    queryKey: ["mrs"],
    queryFn: fetchMRs,
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  const handleTaskAssigned = (task: AssignedTask) => {
    setIsAssignModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  const mrData = useMemo(
    () =>
      (data?.mr_tracking || [])
        .filter((mr) => mr.mr_id != null) // Only include MRs with valid IDs
        .map((mr) => ({
          id: String(mr.mr_id),
          name: mr.mr,
          territory: "—",
          status: mr.visits_today > 0 ? "Working" : "Off",
          visits: mr.visits_today,
          firstPunch: mr.first_punch || "-",
          lastPunch: mr.last_punch || "-",
        })),
    [data?.mr_tracking]
  );

  const filteredMRs = mrData.filter((mr) => {
    const matchesSearch = mr.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTerritory =
      selectedTerritory === "all" || mr.territory === selectedTerritory;
    const matchesStatus =
      selectedStatus === "all" || mr.status === selectedStatus;
    return matchesSearch && matchesTerritory && matchesStatus;
  });

  const visitLogs = useMemo(
    () =>
      (data?.recent_visits || []).map((visit, index) => ({
        id: index + 1,
        time: visit.time,
        mr: visit.mr,
        doctor: visit.doctor,
        notes: visit.notes,
        lat: (visit as any).gps_lat ?? null,
        lng: (visit as any).gps_long ?? null,
        type: "doctor" as const,
      })),
    [data?.recent_visits]
  );

  const shopVisitLogs: Array<{
    id: number;
    time: string;
    mr: string;
    shopName: string;
    location: string;
    notes: string;
    contactPerson?: string;
  }> = [];

  const assignedTasks = useMemo(
    () =>
      (tasksQuery.data || []).map((task) => ({
        id: String(task.id),
        mrId: String(task.assigned_to),
        mrName:
          mrsQuery.data?.find((mr) => mr.id === task.assigned_to)?.name ||
          mrsQuery.data?.find((mr) => mr.id === task.assigned_to)?.username ||
          "MR",
        doctorName:
          doctorsQuery.data?.find((doc) => doc.id === task.assigned_doctor)
            ?.name || "Doctor",
        doctorSpecialty:
          doctorsQuery.data?.find((doc) => doc.id === task.assigned_doctor)
            ?.specialization || "—",
        date: task.due_date,
        time: task.due_time,
        status: task.completed ? "completed" : "pending",
        notes: task.notes,
        createdAt: task.assigned_date,
      })),
    [doctorsQuery.data, mrsQuery.data, tasksQuery.data]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Working":
        return "bg-secondary/10 text-secondary";
      case "Leave":
        return "bg-yellow-500/10 text-yellow-600";
      case "Off":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="pharma-card p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search MRs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select
                value={selectedTerritory}
                onValueChange={setSelectedTerritory}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Territory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Territories</SelectItem>
                  <SelectItem value="North Delhi">North Delhi</SelectItem>
                  <SelectItem value="South Delhi">South Delhi</SelectItem>
                  <SelectItem value="East Delhi">East Delhi</SelectItem>
                  <SelectItem value="West Delhi">West Delhi</SelectItem>
                  <SelectItem value="Central Delhi">Central Delhi</SelectItem>
                  <SelectItem value="Gurgaon">Gurgaon</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Working">Working</SelectItem>
                  <SelectItem value="Leave">Leave</SelectItem>
                  <SelectItem value="Off">Off</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Today
              </Button>
              <Button onClick={() => setIsAssignModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Assign Task
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsAddDoctorOpen(true)}
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                Add Doctor
              </Button>
            </div>
          </div>
        </div>

        <div className="pharma-card overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              MR Attendance Overview
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MR Name</TableHead>
                  <TableHead>Territory</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Visits</TableHead>
                  <TableHead>First Punch</TableHead>
                  <TableHead>Last Punch</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMRs.map((mr) => (
                  <TableRow key={mr.id}>
                    <TableCell>
                      <Link
                        to={`/admin/mr/${mr.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {mr.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {mr.territory}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          mr.status
                        )}`}
                      >
                        {mr.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {mr.visits}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {mr.firstPunch}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {mr.lastPunch}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/admin/mr/${mr.id}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="pharma-card overflow-hidden">
          <Tabs defaultValue="doctor" className="w-full">
            <div className="p-4 lg:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="font-semibold text-foreground">
                Recent Visit Logs
              </h3>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger
                  value="doctor"
                  className="flex-1 sm:flex-none gap-1.5"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline">Doctor Visits</span>
                  <span className="sm:hidden">Doctors</span>
                </TabsTrigger>
                <TabsTrigger
                  value="shop"
                  className="flex-1 sm:flex-none gap-1.5"
                >
                  <Store className="w-4 h-4" />
                  <span className="hidden sm:inline">Shop Visits</span>
                  <span className="sm:hidden">Shops</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="doctor" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>MR</TableHead>
                      <TableHead>Doctor Visited</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Notes
                      </TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitLogs.map((visit) => (
                      <TableRow key={visit.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          {visit.time}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {visit.mr}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {visit.doctor}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate hidden md:table-cell text-xs sm:text-sm">
                          {visit.notes}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              visit.lat && visit.lng
                                ? setSelectedVisit(visit)
                                : null
                            }
                            className="text-xs sm:text-sm"
                            disabled={!visit.lat || !visit.lng}
                          >
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">
                              {visit.lat && visit.lng
                                ? "View on Map"
                                : "No GPS"}
                            </span>
                            <span className="sm:hidden">
                              {visit.lat && visit.lng ? "Map" : "N/A"}
                            </span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="shop" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>MR</TableHead>
                      <TableHead>Shop Name</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Location
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Contact
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Notes
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shopVisitLogs.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground text-sm py-6"
                        >
                          No shop visits recorded.
                        </TableCell>
                      </TableRow>
                    ) : (
                      shopVisitLogs.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">
                            {visit.time}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {visit.mr}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5">
                              <Store className="w-3 h-3 text-primary flex-shrink-0" />
                              <span className="truncate">{visit.shopName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden md:table-cell text-xs sm:text-sm">
                            {visit.location}
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden lg:table-cell text-xs sm:text-sm">
                            {visit.contactPerson}
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-xs truncate hidden md:table-cell text-xs sm:text-sm">
                            {visit.notes}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="pharma-card overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Assigned Tasks</h3>
            <span className="text-sm text-muted-foreground">
              {assignedTasks.filter((t) => t.status === "pending").length}{" "}
              pending
            </span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MR</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.mrName}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{task.doctorName}</span>
                        <p className="text-xs text-muted-foreground">
                          {task.doctorSpecialty}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(task.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      {task.time ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.time}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Flexible</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === "completed"
                            ? "bg-secondary/10 text-secondary"
                            : "bg-yellow-500/10 text-yellow-600"
                        }`}
                      >
                        {task.status === "completed" && (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {task.status === "completed" ? "Completed" : "Pending"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {task.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <VisitMapModal
        visit={selectedVisit}
        onClose={() => setSelectedVisit(null)}
      />

      <AssignTaskModal
        open={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onTaskAssigned={handleTaskAssigned}
        mrs={(mrsQuery.data || []).map((mr) => ({
          id: mr.id,
          name: mr.name || "",
          username: mr.username,
        }))}
        doctors={doctorsQuery.data || []}
      />

      <AddDoctorModal
        open={isAddDoctorOpen}
        onClose={() => setIsAddDoctorOpen(false)}
        onDoctorCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["doctors"] });
        }}
      />
    </AdminLayout>
  );
}
