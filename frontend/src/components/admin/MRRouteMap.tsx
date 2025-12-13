import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

interface Visit {
  id: string | number;
  lat?: number | null;
  lng?: number | null;
  time: string;
  type: "doctor" | "shop";
  name: string;
  date: string;
}

interface MRRouteMapProps {
  visits: Visit[];
  selectedDate: string;
  mrName: string;
}

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export function MRRouteMap({ visits, selectedDate, mrName }: MRRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
    markersRef.current = [];
    if (polylineRef.current) {
      polylineRef.current = null;
    }

    // Filter visits for selected date
    const dateKey = selectedDate || new Date().toISOString().split("T")[0];
    const todayVisits = visits.filter(
      (v) => v.date === dateKey && v.lat && v.lng
    );

    if (todayVisits.length === 0) {
      // No visits for this date
      return;
    }

    // Create map centered on first visit
    const firstVisit = todayVisits[0];
    const map = L.map(mapRef.current, { preferCanvas: true }).setView(
      [firstVisit.lat!, firstVisit.lng!],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Create markers for each visit
    const markers: L.Marker[] = [];
    const coordinates: [number, number][] = [];

    todayVisits.forEach((visit, index) => {
      if (visit.lat === null || visit.lng === null) return;

      const lat = visit.lat;
      const lng = visit.lng;
      coordinates.push([lat, lng]);

      // Create custom icon color based on visit type
      const iconColor = visit.type === "doctor" ? "#3b82f6" : "#a855f7"; // blue for doctor, purple for shop
      const html = `
        <div style="
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: ${iconColor};
          border-radius: 50%;
          border: 3px solid white;
          font-weight: bold;
          color: white;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          ${index + 1}
        </div>
      `;

      const customIcon = L.divIcon({
        html,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
        className: "custom-marker",
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      const popupText = `
        <div style="padding: 8px; min-width: 200px;">
          <strong>${visit.time}</strong> – ${
        visit.type === "doctor" ? "🩺" : "🏪"
      } ${visit.name}<br/>
          <small>Type: ${
            visit.type === "doctor" ? "Doctor Visit" : "Shop Visit"
          }</small><br/>
          <small>Lat: ${visit.lat.toFixed(4)}, Lng: ${visit.lng.toFixed(
        4
      )}</small>
        </div>
      `;

      marker.bindPopup(popupText);
      markers.push(marker);
    });

    markersRef.current = markers;

    // Draw polyline connecting all visits in order
    if (coordinates.length > 1) {
      const polyline = L.polyline(coordinates, {
        color: "#06b6d4",
        weight: 3,
        opacity: 0.7,
        dashArray: "5, 5",
      }).addTo(map);
      polylineRef.current = polyline;

      // Fit map bounds to show entire route
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    mapInstanceRef.current = map;

    // Invalidate size after render to ensure tiles appear
    setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {
        // ignore
      }
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [visits, selectedDate]);

  // Filter for display
  const dateKey = selectedDate || new Date().toISOString().split("T")[0];
  const todayVisits = visits.filter(
    (v) => v.date === dateKey && v.lat && v.lng
  );

  return (
    <div className="pharma-card overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-border">
        <h3 className="font-semibold text-foreground">Route Map – {mrName}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {todayVisits.length > 0
            ? `${todayVisits.length} visit${
                todayVisits.length !== 1 ? "s" : ""
              } on ${selectedDate}`
            : `No visits recorded for ${selectedDate}`}
        </p>
      </div>

      {todayVisits.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
          <MapPin className="w-8 h-8 opacity-50" />
          <p>No visits recorded for this date.</p>
        </div>
      ) : (
        <>
          <div
            ref={mapRef}
            className="h-80 w-full"
            style={{ position: "relative" }}
          />
          <div className="p-4 bg-muted/30 border-t border-border">
            <div className="text-xs space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: "#3b82f6" }}
                />
                <span>Doctor Visit</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: "#a855f7" }}
                />
                <span>Shop Visit</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-0.5 w-6"
                  style={{ backgroundColor: "#06b6d4" }}
                />
                <span>Route (chronological order)</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
