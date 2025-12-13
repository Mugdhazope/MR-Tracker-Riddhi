import { useParams, Link, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Clock,
  Download,
  Stethoscope,
  Store,
  Navigation,
  ChevronDown,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo, useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { VisitMapModal } from "@/components/admin/VisitMapModal";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminMRDetail, getStoredUser } from "@/lib/api";
import { fetchDoctors, fetchMRs } from "@/lib/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssignTaskModal } from "@/components/admin/AssignTaskModal";
import { MRRouteMap } from "@/components/admin/MRRouteMap";

type CombinedVisit = {
  id: string | number;
  type: "doctor" | "shop";
  doctorName?: string;
  doctorSpecialty?: string;
  shopName?: string;
  shopLocation?: string | null;
  contactPerson?: string | null;
  notes?: string | null;
  date: string;
  time: string;
  lat?: number | null;
  lng?: number | null;
  visitType?: "task" | "self";
};

export default function MRDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useMemo(() => getStoredUser(), []);
  const mapRef = useRef<HTMLDivElement>(null);

  const [selectedVisit, setSelectedVisit] = useState<{
    id: string;
    time: string;
    doctor?: string;
    shop?: string;
    notes: string;
    lat?: number | null;
    lng?: number | null;
    type: "doctor" | "shop";
  } | null>(null);

  const [dateRange, setDateRange] = useState<
    "all" | "today" | "yesterday" | "week" | "month" | "custom"
  >("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Redirect if not admin
  if (user && user.role !== "admin") {
    navigate("/mr/dashboard");
  }

  const mrIdNum = useMemo(() => {
    if (!id) return null;
    const parsed = Number(id);
    return isNaN(parsed) ? null : parsed;
  }, [id]);

  const queryClient = useQueryClient();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Calculate date range for API
  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    let start = "";
    let end = "";

    switch (dateRange) {
      case "today":
        start = today.toISOString().split("T")[0];
        end = today.toISOString().split("T")[0];
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        start = yesterday.toISOString().split("T")[0];
        end = yesterday.toISOString().split("T")[0];
        break;
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        start = weekStart.toISOString().split("T")[0];
        end = today.toISOString().split("T")[0];
        break;
      case "month":
        const monthStart = new Date(today);
        monthStart.setDate(today.getDate() - 30);
        start = monthStart.toISOString().split("T")[0];
        end = today.toISOString().split("T")[0];
        break;
      case "custom":
        start = customStartDate;
        end = customEndDate;
        break;
      default: // all
        break;
    }

    return { startDate: start, endDate: end };
  }, [dateRange, customStartDate, customEndDate]);

  const mrDetailQuery = useQuery({
    queryKey: ["admin-mr-detail", mrIdNum, startDate, endDate],
    queryFn: () =>
      mrIdNum
        ? fetchAdminMRDetail(mrIdNum, startDate, endDate)
        : Promise.reject("No MR ID"),
    enabled: !!mrIdNum,
  });

  const doctorsQuery = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctors,
  });
  const mrsQuery = useQuery({ queryKey: ["mrs"], queryFn: fetchMRs });

  const data = mrDetailQuery.data;
  const isLoading = mrDetailQuery.isLoading;

  const doctorVisits: CombinedVisit[] = useMemo(() => {
    if (!data?.doctor_visits) return [];
    return data.doctor_visits.map((v) => ({
      id: `doctor-${v.id}`,
      type: "doctor" as const,
      doctorName: v.doctor_name_display || "Unknown",
      doctorSpecialty: v.doctor_specialization || "",
      notes: v.notes || "",
      date: v.visit_date,
      time: v.visit_time,
      lat: v.gps_lat,
      lng: v.gps_long,
      visitType: v.visit_type as "task" | "self",
    }));
  }, [data?.doctor_visits]);

  const shopVisits: CombinedVisit[] = useMemo(() => {
    if (!data?.shop_visits) return [];
    return data.shop_visits.map((v) => ({
      id: `shop-${v.id}`,
      type: "shop" as const,
      shopName: v.shop_name || "Unknown",
      shopLocation: v.location || null,
      contactPerson: v.contact_person || null,
      notes: v.notes || "",
      date: v.visit_date,
      time: v.visit_time,
      visitType: v.visit_type as "task" | "self",
    }));
  }, [data?.shop_visits]);

  const combinedVisits = useMemo(
    () =>
      [...doctorVisits, ...shopVisits].sort((a, b) =>
        `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)
      ),
    [doctorVisits, shopVisits]
  );

  // Initialize map
  useEffect(() => {
    if (mapRef.current && selectedVisit?.lat && selectedVisit?.lng) {
      const map = L.map(mapRef.current).setView(
        [selectedVisit.lat, selectedVisit.lng],
        15
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        map
      );
      L.marker([selectedVisit.lat, selectedVisit.lng]).addTo(map);

      return () => {
        map.remove();
      };
    }
  }, [selectedVisit]);

  const totalVisits = combinedVisits.length;
  const doctorVisitCount = doctorVisits.length;
  const shopVisitCount = shopVisits.length;

  // Show loading state
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/admin/mr-tracking">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to MR Tracking
              </Button>
            </Link>
            <div>
              <Button
                onClick={() => setIsAssignModalOpen(true)}
                className="ml-2"
              >
                Assign Task
              </Button>
            </div>
          </div>
          <div className="pharma-card p-6 text-center">
            <div className="text-muted-foreground">Loading MR details...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error if invalid ID or MR not found
  if (!mrIdNum || (mrDetailQuery.isSuccess && !data)) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Link to="/admin/mr-tracking">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to MR Tracking
            </Button>
          </Link>
          <div className="pharma-card p-6 text-center">
            <p className="text-muted-foreground">
              {!mrIdNum ? "Invalid MR ID" : "MR not found"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">ID: {id}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const getVisitTypeColor = (type: "task" | "self" | undefined) => {
    return type === "task"
      ? "bg-blue-500/10 text-blue-600 border border-blue-200"
      : "bg-gray-500/10 text-gray-600 border border-gray-200";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Link to="/admin/mr-tracking">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to MR Tracking
          </Button>
        </Link>

        <div className="pharma-card p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-10 h-10 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {data?.mr_name || `MR #${mrIdNum}`}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {data?.mr_username && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {data.mr_username}
                  </span>
                )}
                {mrIdNum && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    User ID #{mrIdNum}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalVisits}
                </p>
                <p className="text-sm text-muted-foreground">Total Visits</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {doctorVisitCount}
                </p>
                <p className="text-sm text-muted-foreground">Doctor Visits</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">
                  {shopVisitCount}
                </p>
                <p className="text-sm text-muted-foreground">Shop Visits</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {data?.statistics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="pharma-card p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Task-Based Visits
              </p>
              <p className="text-2xl font-bold text-primary">
                {data.statistics.task_based_doctor_visits +
                  data.statistics.task_based_shop_visits}
              </p>
            </div>
            <div className="pharma-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Self Visits</p>
              <p className="text-2xl font-bold text-secondary">
                {data.statistics.self_visit_doctor_visits +
                  data.statistics.self_visit_shop_visits}
              </p>
            </div>
            <div className="pharma-card p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Doctor Visits
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {data.statistics.total_doctor_visits}
              </p>
            </div>
            <div className="pharma-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Shop Visits</p>
              <p className="text-2xl font-bold text-purple-600">
                {data.statistics.total_shop_visits}
              </p>
            </div>
          </div>
        )}

        {/* Date Range Filter */}
        <div className="pharma-card p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Date Range
            </label>
            <Select
              value={dateRange}
              onValueChange={(val: any) => setDateRange(val)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateRange === "custom" && (
            <>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  From
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  To
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
            </>
          )}

          <Button variant="outline" size="sm" className="ml-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Route Map */}
        {data && (
          <MRRouteMap
            visits={combinedVisits.map((v) => ({
              id: v.id,
              lat: v.lat ?? null,
              lng: v.lng ?? null,
              time: v.time,
              type: v.type,
              name:
                v.type === "doctor"
                  ? v.doctorName || "Unknown"
                  : v.shopName || "Unknown",
              date: v.date,
            }))}
            selectedDate={startDate || new Date().toISOString().split("T")[0]}
            mrName={data.mr_name || data.mr_username || `MR #${mrIdNum}`}
          />
        )}

        {/* Top Doctors */}
        {data?.top_doctors && data.top_doctors.length > 0 && (
          <div className="pharma-card">
            <div className="p-4 lg:p-6 border-b border-border">
              <h3 className="font-semibold text-foreground">
                Most Visited Doctors
              </h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.top_doctors.map((doctor, i) => (
                    <TableRow
                      key={`${doctor.doctor_name__name || "doctor"}-${i}`}
                    >
                      <TableCell className="font-medium">
                        {doctor.doctor_name__name}
                      </TableCell>
                      <TableCell>
                        {doctor.doctor_name__specialization}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {doctor.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Visit Logs */}
        <div className="pharma-card overflow-hidden">
          <Tabs defaultValue="all" className="w-full">
            <div className="p-4 lg:p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Visit Logs</h3>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger
                  value="doctor"
                  className="flex items-center gap-1.5"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span className="hidden sm:inline">Doctor</span>
                </TabsTrigger>
                <TabsTrigger value="shop" className="flex items-center gap-1.5">
                  <Store className="w-4 h-4" />
                  <span className="hidden sm:inline">Shop</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* All Visits */}
            <TabsContent value="all" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Specialty/Location
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Notes
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Visit Type
                      </TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {combinedVisits.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground py-8"
                        >
                          No visits recorded for this period
                        </TableCell>
                      </TableRow>
                    ) : (
                      combinedVisits.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell className="font-medium text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(visit.date).toLocaleDateString("en-IN")}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {visit.time}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {visit.type === "doctor" ? (
                              <div className="flex items-center gap-1">
                                <Stethoscope className="w-4 h-4 text-blue-600" />
                                Doctor
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Store className="w-4 h-4 text-purple-600" />
                                Shop
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {visit.type === "doctor"
                              ? visit.doctorName
                              : visit.shopName}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden md:table-cell truncate max-w-xs">
                            {visit.type === "doctor"
                              ? visit.doctorSpecialty
                              : visit.shopLocation || "-"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden lg:table-cell truncate max-w-xs">
                            {visit.notes || "-"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVisitTypeColor(
                                visit.visitType
                              )}`}
                            >
                              {visit.visitType === "task" ? "Task" : "Self"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {visit.lat && visit.lng ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setSelectedVisit({
                                    id: String(visit.id),
                                    time: visit.time,
                                    doctor:
                                      visit.type === "doctor"
                                        ? visit.doctorName
                                        : undefined,
                                    shop:
                                      visit.type === "shop"
                                        ? visit.shopName
                                        : undefined,
                                    notes: visit.notes || "",
                                    lat: visit.lat,
                                    lng: visit.lng,
                                    type: visit.type,
                                  })
                                }
                                className="text-xs"
                              >
                                <MapPin className="w-3 h-3 mr-1" />
                                Map
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                No GPS
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Doctor Visits Only */}
            <TabsContent value="doctor" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Specialization
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Notes
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Visit Type
                      </TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctorVisits.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-8"
                        >
                          No doctor visits recorded
                        </TableCell>
                      </TableRow>
                    ) : (
                      doctorVisits.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(visit.date).toLocaleDateString(
                                "en-IN"
                              )}{" "}
                              {visit.time}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {visit.doctorName}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                            {visit.doctorSpecialty}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground hidden lg:table-cell truncate max-w-xs">
                            {visit.notes || "-"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVisitTypeColor(
                                visit.visitType
                              )}`}
                            >
                              {visit.visitType === "task" ? "Task" : "Self"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {visit.lat && visit.lng ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setSelectedVisit({
                                    id: String(visit.id),
                                    time: visit.time,
                                    doctor: visit.doctorName,
                                    notes: visit.notes || "",
                                    lat: visit.lat,
                                    lng: visit.lng,
                                    type: "doctor",
                                  })
                                }
                                className="text-xs"
                              >
                                <MapPin className="w-3 h-3 mr-1" />
                                Map
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                No GPS
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Shop Visits Only */}
            <TabsContent value="shop" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Shop Name</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Location
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Contact Person
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Visit Type
                      </TableHead>
                      <TableHead className="text-right">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shopVisits.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground py-8"
                        >
                          No shop visits recorded
                        </TableCell>
                      </TableRow>
                    ) : (
                      shopVisits.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(visit.date).toLocaleDateString(
                                "en-IN"
                              )}{" "}
                              {visit.time}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {visit.shopName}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground hidden md:table-cell truncate max-w-xs">
                            {visit.shopLocation || "-"}
                          </TableCell>
                          <TableCell className="text-sm hidden lg:table-cell truncate max-w-xs">
                            {visit.contactPerson || "-"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVisitTypeColor(
                                visit.visitType
                              )}`}
                            >
                              {visit.visitType === "task" ? "Task" : "Self"}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground text-right truncate max-w-xs">
                            {visit.notes || "-"}
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
      </div>

      <VisitMapModal
        open={!!selectedVisit}
        visit={selectedVisit}
        onClose={() => setSelectedVisit(null)}
      />

      <AssignTaskModal
        open={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        mrs={(mrsQuery.data || []).map((mr) => ({
          id: mr.id,
          name: mr.name || "",
          username: mr.username,
        }))}
        doctors={doctorsQuery.data || []}
        defaultMRId={mrIdNum ?? undefined}
        onTaskAssigned={() => {
          // refresh tasks and admin dashboard and mr detail
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
          queryClient.invalidateQueries({
            queryKey: ["admin-mr-detail", mrIdNum],
          });
          setIsAssignModalOpen(false);
        }}
      />
    </AdminLayout>
  );
}
