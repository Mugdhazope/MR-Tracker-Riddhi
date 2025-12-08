import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, MapPin, Calendar, Clock, Download, Play } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState, useEffect, useRef } from 'react';
import { VisitMapModal } from '@/components/admin/VisitMapModal';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const mrDetails = {
  '1': {
    name: 'Rahul Kumar',
    territory: 'North Delhi',
    email: 'rahul.kumar@riddhi.com',
    phone: '+91 98765 43210',
    joinDate: 'Jan 15, 2023',
    totalDays: 180,
    workingDays: 156,
  },
};

const attendanceHistory = [
  { date: 'Dec 6, 2024', status: 'Working', visits: 8 },
  { date: 'Dec 5, 2024', status: 'Working', visits: 7 },
  { date: 'Dec 4, 2024', status: 'Working', visits: 9 },
  { date: 'Dec 3, 2024', status: 'Leave', visits: 0 },
  { date: 'Dec 2, 2024', status: 'Working', visits: 6 },
];

const visitHistory = [
  { id: 1, date: 'Dec 6, 2024', time: '9:30 AM', doctor: 'Dr. Sharma', notes: 'Follow-up visit', lat: 28.6139, lng: 77.2090 },
  { id: 2, date: 'Dec 6, 2024', time: '11:00 AM', doctor: 'Dr. Patel', notes: 'Sample delivery', lat: 28.6280, lng: 77.2169 },
  { id: 3, date: 'Dec 6, 2024', time: '1:30 PM', doctor: 'Dr. Mehta', notes: 'Product demo', lat: 28.6448, lng: 77.2167 },
  { id: 4, date: 'Dec 6, 2024', time: '3:00 PM', doctor: 'Dr. Singh', notes: 'New prescription discussion', lat: 28.6692, lng: 77.2270 },
];

const routePoints: [number, number][] = [
  [28.6139, 77.2090],
  [28.6280, 77.2169],
  [28.6448, 77.2167],
  [28.6692, 77.2270],
];

export default function MRDetail() {
  const { id } = useParams();
  const [selectedVisit, setSelectedVisit] = useState<typeof visitHistory[0] | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mr = mrDetails[id as keyof typeof mrDetails] || mrDetails['1'];

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([28.6448, 77.2167], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      L.polyline(routePoints, { color: 'hsl(187, 79%, 35%)', weight: 3 }).addTo(mapInstanceRef.current);

      routePoints.forEach((point, index) => {
        const marker = L.circleMarker(point, {
          radius: 8,
          fillColor: 'hsl(187, 79%, 35%)',
          color: '#fff',
          weight: 2,
          fillOpacity: 1,
        }).addTo(mapInstanceRef.current!);
        marker.bindPopup(`Visit ${index + 1}: ${visitHistory[index]?.doctor || 'Doctor'}`);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Working': return 'bg-secondary/10 text-secondary';
      case 'Leave': return 'bg-yellow-500/10 text-yellow-600';
      case 'Off': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
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
              <h2 className="text-2xl font-bold text-foreground mb-1">{mr.name}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {mr.territory}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {mr.joinDate}
                </span>
              </div>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{mr.totalDays}</p>
                <p className="text-sm text-muted-foreground">Total Days</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">{mr.workingDays}</p>
                <p className="text-sm text-muted-foreground">Working Days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="pharma-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Today's Route</h3>
              <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                <Play className="w-4 h-4 mr-2" />
                {isPlaying ? 'Pause' : 'Play Route'}
              </Button>
            </div>
            <div ref={mapRef} className="h-72" />
          </div>

          <div className="pharma-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Attendance History</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Visits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceHistory.map((day, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{day.date}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(day.status)}`}>
                          {day.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{day.visits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="pharma-card overflow-hidden">
          <div className="p-4 lg:p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Visit Logs</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Doctor Visited</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitHistory.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell className="font-medium">{visit.date}</TableCell>
                    <TableCell>{visit.time}</TableCell>
                    <TableCell>{visit.doctor}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">{visit.notes}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedVisit(visit as any)}
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        View on Map
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <VisitMapModal 
        visit={selectedVisit ? { ...selectedVisit, mr: mr.name } as any : null}
        onClose={() => setSelectedVisit(null)}
      />
    </AdminLayout>
  );
}
