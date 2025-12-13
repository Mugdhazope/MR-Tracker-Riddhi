import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchAdminAnalytics } from "@/lib/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function Analytics() {
  const heatmapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyVisitData, setDailyVisitData] = useState<any[]>([]);
  const [mrProductivityData, setMrProductivityData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [territories, setTerritories] = useState<any[]>([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAdminAnalytics(period);

        // Transform daily trends for chart
        const chartData = data.daily_trends.map((trend: any) => ({
          name: new Date(trend.date).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          }),
          doctorVisits: trend.doctor_visits,
          shopVisits: trend.shop_visits,
          total: trend.total,
        }));
        setDailyVisitData(chartData);

        // Top MRs by productivity
        const topMRs = data.mr_performance.slice(0, 6).map((mr: any) => ({
          name: mr.mr_name,
          visits: mr.total_visits,
        }));
        setMrProductivityData(topMRs);

        // Set summary stats
        setSummary(data.summary);

        // Estimate territories from top doctors (this is a limitation without geographic data in DB)
        // For now, we'll create synthetic territory data based on visit density
        const territoryPoints = [
          { name: "Zone A", lat: 28.7041, lng: 77.1025 },
          { name: "Zone B", lat: 28.5245, lng: 77.2066 },
          { name: "Zone C", lat: 28.628, lng: 77.295 },
          { name: "Zone D", lat: 28.6519, lng: 77.056 },
          { name: "Zone E", lat: 28.6448, lng: 77.2167 },
          { name: "Zone F", lat: 28.4595, lng: 77.0266 },
        ];

        // Distribute visits across zones based on available data
        const zonesWithVisits = territoryPoints.map((zone, idx) => {
          const visitsPerZone =
            Math.floor(data.summary.total_visits / 6) +
            (idx < data.summary.total_visits % 6 ? 1 : 0);
          return {
            ...zone,
            visits: Math.max(1, visitsPerZone),
            intensity: Math.min(
              1,
              visitsPerZone / (data.summary.total_visits / 3)
            ),
          };
        });

        setTerritories(zonesWithVisits);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics"
        );
        console.error("Analytics error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [period]);

  useEffect(() => {
    if (
      heatmapRef.current &&
      territories.length > 0 &&
      !mapInstanceRef.current
    ) {
      mapInstanceRef.current = L.map(heatmapRef.current).setView(
        [28.6139, 77.209],
        10
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstanceRef.current);

      territories.forEach((territory) => {
        const circle = L.circle([territory.lat, territory.lng], {
          color: "transparent",
          fillColor: `hsl(187, 79%, ${50 - territory.intensity * 20}%)`,
          fillOpacity: territory.intensity * 0.6,
          radius: Math.max(500, territory.visits * 50),
        }).addTo(mapInstanceRef.current!);
        circle.bindPopup(
          `<strong>${territory.name}</strong><br/>${territory.visits} visits`
        );
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [territories]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading analytics...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-destructive">Error: {error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Period selector and summary stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Real-time performance metrics
            </p>
          </div>
          <div className="flex gap-2">
            {(["day", "week", "month"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  period === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="pharma-card p-4">
              <p className="text-sm text-muted-foreground">Total Visits</p>
              <p className="text-2xl font-bold text-foreground">
                {summary.total_visits}
              </p>
            </div>
            <div className="pharma-card p-4">
              <p className="text-sm text-muted-foreground">Doctor Visits</p>
              <p className="text-2xl font-bold text-foreground">
                {summary.total_doctor_visits}
              </p>
            </div>
            <div className="pharma-card p-4">
              <p className="text-sm text-muted-foreground">Shop Visits</p>
              <p className="text-2xl font-bold text-foreground">
                {summary.total_shop_visits}
              </p>
            </div>
            <div className="pharma-card p-4">
              <p className="text-sm text-muted-foreground">Active MRs</p>
              <p className="text-2xl font-bold text-foreground">
                {summary.active_mrs}/{summary.total_mrs}
              </p>
            </div>
            <div className="pharma-card p-4">
              <p className="text-sm text-muted-foreground">Coverage</p>
              <p className="text-2xl font-bold text-foreground">
                {summary.total_mrs
                  ? Math.round((summary.active_mrs / summary.total_mrs) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="pharma-card p-5 lg:p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-foreground">
                Daily Visit Trend
              </h3>
              <p className="text-sm text-muted-foreground">
                {period === "day"
                  ? "Today"
                  : `Last ${period === "week" ? "7 days" : "30 days"}`}
              </p>
            </div>
            <div className="h-64">
              {dailyVisitData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyVisitData}>
                    <defs>
                      <linearGradient
                        id="colorVisitsAnalytics"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorVisitsAnalytics)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </div>

          <div className="pharma-card p-5 lg:p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-foreground">Top MRs</h3>
              <p className="text-sm text-muted-foreground">
                Most visits in this period
              </p>
            </div>
            <div className="h-64">
              {mrProductivityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mrProductivityData} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="visits"
                      fill="hsl(var(--secondary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pharma-card overflow-hidden">
          <div className="p-5 lg:p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Territory Heatmap</h3>
            <p className="text-sm text-muted-foreground">
              Visit density by zone (estimated)
            </p>
          </div>
          <div ref={heatmapRef} className="h-96" />
        </div>

        {territories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {territories.map((territory) => (
              <div key={territory.name} className="pharma-card p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {territory.visits}
                </p>
                <p className="text-sm text-muted-foreground">
                  {territory.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
