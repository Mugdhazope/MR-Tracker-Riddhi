import { useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const dailyVisitData = [
  { name: 'Dec 1', visits: 45 },
  { name: 'Dec 2', visits: 52 },
  { name: 'Dec 3', visits: 48 },
  { name: 'Dec 4', visits: 65 },
  { name: 'Dec 5', visits: 58 },
  { name: 'Dec 6', visits: 72 },
  { name: 'Dec 7', visits: 38 },
];

const mrProductivityData = [
  { name: 'Rahul K.', visits: 56 },
  { name: 'Priya S.', visits: 48 },
  { name: 'Amit R.', visits: 42 },
  { name: 'Sneha M.', visits: 52 },
  { name: 'Vikram T.', visits: 38 },
  { name: 'Neha G.', visits: 45 },
];

const territoryData = [
  { name: 'North Delhi', lat: 28.7041, lng: 77.1025, visits: 120, intensity: 0.8 },
  { name: 'South Delhi', lat: 28.5245, lng: 77.2066, visits: 95, intensity: 0.6 },
  { name: 'East Delhi', lat: 28.6280, lng: 77.2950, visits: 80, intensity: 0.5 },
  { name: 'West Delhi', lat: 28.6519, lng: 77.0560, visits: 110, intensity: 0.7 },
  { name: 'Central Delhi', lat: 28.6448, lng: 77.2167, visits: 150, intensity: 0.9 },
  { name: 'Gurgaon', lat: 28.4595, lng: 77.0266, visits: 70, intensity: 0.4 },
];

export default function Analytics() {
  const heatmapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (heatmapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(heatmapRef.current).setView([28.6139, 77.2090], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      territoryData.forEach((territory) => {
        const circle = L.circle([territory.lat, territory.lng], {
          color: 'transparent',
          fillColor: `hsl(187, 79%, ${50 - territory.intensity * 20}%)`,
          fillOpacity: territory.intensity * 0.6,
          radius: territory.visits * 50,
        }).addTo(mapInstanceRef.current!);
        circle.bindPopup(`<strong>${territory.name}</strong><br/>${territory.visits} visits`);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="pharma-card p-5 lg:p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-foreground">Daily Visit Count</h3>
              <p className="text-sm text-muted-foreground">Last 7 days trend</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyVisitData}>
                  <defs>
                    <linearGradient id="colorVisitsAnalytics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
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
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorVisitsAnalytics)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pharma-card p-5 lg:p-6">
            <div className="mb-6">
              <h3 className="font-semibold text-foreground">MR-wise Productivity</h3>
              <p className="text-sm text-muted-foreground">Visits per MR this week</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mrProductivityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
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
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="visits" 
                    fill="hsl(var(--secondary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="pharma-card overflow-hidden">
          <div className="p-5 lg:p-6 border-b border-border">
            <h3 className="font-semibold text-foreground">Territory Heatmap</h3>
            <p className="text-sm text-muted-foreground">Visit density by territory</p>
          </div>
          <div ref={heatmapRef} className="h-96" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {territoryData.map((territory) => (
            <div key={territory.name} className="pharma-card p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{territory.visits}</p>
              <p className="text-sm text-muted-foreground">{territory.name}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
