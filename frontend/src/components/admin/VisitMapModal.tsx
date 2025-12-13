import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Clock, User, Stethoscope } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface VisitMapModalProps {
  visit: {
    id: number | string;
    time: string;
    doctor?: string;
    shop?: string;
    notes: string;
    lat?: number | null;
    lng?: number | null;
    type?: "doctor" | "shop";
  } | null;
  open?: boolean;
  onClose: () => void;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export function VisitMapModal({ visit, onClose }: VisitMapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Use the same initialization logic as MRRouteMap but for a single visit.
    if (!mapRef.current) return;

    // cleanup any existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    if (
      visit &&
      visit.lat !== undefined &&
      visit.lng !== undefined &&
      visit.lat !== null &&
      visit.lng !== null
    ) {
      const lat = visit.lat;
      const lng = visit.lng;

      const map = L.map(mapRef.current, { preferCanvas: true }).setView(
        [lat, lng],
        15
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Use a similar divIcon style as MRRouteMap but for single marker (number 1)
      const html = `
        <div style="
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #3b82f6;
          border-radius: 50%;
          border: 3px solid white;
          font-weight: bold;
          color: white;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        ">1</div>
      `;

      const customIcon = L.divIcon({
        html,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        className: "custom-marker",
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      const visitName = visit.doctor || visit.shop || "Unknown";
      const visitType = visit.doctor ? "Doctor" : "Shop";

      const popup = `
        <div style="padding:8px; min-width:200px">
          <strong>${visit.time}</strong> – ${visitName}<br/>
          <small>${visitType} Visit</small><br/>
          <small>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</small>
        </div>
      `;

      marker.bindPopup(popup).openPopup();

      // Fit to marker with a small padding
      map.setView([lat, lng], 15);

      // Ensure tiles render inside modal with multiple invalidate calls
      // First call immediately after map creation
      map.invalidateSize();

      // Additional calls to handle modal animation and dialog rendering
      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch (e) {}
      }, 50);

      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch (e) {}
      }, 200);

      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch (e) {}
      }, 500);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [visit]);

  const openInGoogleMaps = () => {
    if (
      visit &&
      visit.lat !== undefined &&
      visit.lng !== undefined &&
      visit.lat !== null &&
      visit.lng !== null
    ) {
      window.open(
        `https://www.google.com/maps?q=${visit.lat},${visit.lng}`,
        "_blank"
      );
    }
  };

  return (
    <Dialog open={!!visit} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">Visit Location</DialogTitle>
          <DialogDescription>
            Map preview showing the visit location and punch time.
          </DialogDescription>
        </DialogHeader>

        {visit && (
          <div className="p-6 pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {visit.doctor ? "Doctor" : "Shop"}
                  </p>
                  <p className="text-sm font-medium">
                    {visit.doctor || visit.shop || "Unknown"}
                  </p>
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

            {visit.lat !== undefined &&
            visit.lng !== undefined &&
            visit.lat !== null &&
            visit.lng !== null ? (
              <>
                <div
                  ref={mapRef}
                  className="h-80 w-full rounded-lg border border-border"
                  style={{ position: "relative", minHeight: "320px" }}
                />

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>
                      Lat: {visit.lat.toFixed(4)}, Lng: {visit.lng.toFixed(4)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openInGoogleMaps}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Google Maps
                  </Button>
                </div>
              </>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                GPS coordinates not available for this visit.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
