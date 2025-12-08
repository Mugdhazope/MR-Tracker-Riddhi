import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink, Clock, User, Stethoscope } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface VisitMapModalProps {
  visit: {
    id: number;
    time: string;
    mr: string;
    doctor: string;
    notes: string;
    lat: number;
    lng: number;
  } | null;
  onClose: () => void;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export function VisitMapModal({ visit, onClose }: VisitMapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (visit && mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([visit.lat, visit.lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      const marker = L.marker([visit.lat, visit.lng]).addTo(mapInstanceRef.current);
      marker.bindPopup(`
        <div class="p-2">
          <strong>${visit.doctor}</strong><br/>
          <span class="text-sm text-gray-600">Visited by ${visit.mr}</span><br/>
          <span class="text-sm text-gray-600">${visit.time}</span>
        </div>
      `).openPopup();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [visit]);

  const openInGoogleMaps = () => {
    if (visit) {
      window.open(`https://www.google.com/maps?q=${visit.lat},${visit.lng}`, '_blank');
    }
  };

  return (
    <Dialog open={!!visit} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">Visit Location</DialogTitle>
        </DialogHeader>
        
        {visit && (
          <div className="p-6 pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">MR</p>
                  <p className="text-sm font-medium">{visit.mr}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">Doctor</p>
                  <p className="text-sm font-medium">{visit.doctor}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-medium">{visit.time}</p>
                </div>
              </div>
            </div>

            <div 
              ref={mapRef} 
              className="h-64 sm:h-80 rounded-lg border border-border overflow-hidden"
            />

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Lat: {visit.lat.toFixed(4)}, Lng: {visit.lng.toFixed(4)}</span>
              </div>
              <Button variant="outline" size="sm" onClick={openInGoogleMaps}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Google Maps
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
