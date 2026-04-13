"use client";

import { useEffect, useRef } from "react";

interface RouteMapProps {
  geometry: [number, number][]; // [lat, lon] pairs
  pickupName: string;
  destName: string;
}

export default function RouteMap({
  geometry,
  pickupName,
  destName,
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ReturnType<
    (typeof import("leaflet"))["map"]
  > | null>(null);

  useEffect(() => {
    if (!mapRef.current || geometry.length === 0) return;

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet@1.9"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((L) => {
      // Destroy previous map instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Fix default marker icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        zoomAnimation: false,
        markerZoomAnimation: false,
      });
      mapInstanceRef.current = map;

      // OSM tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Route polyline in gold
      const polyline = L.polyline(geometry, {
        color: "#d4af37",
        weight: 5,
        opacity: 0.9,
      }).addTo(map);

      // Start marker (green)
      const startIcon = L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.6)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      // End marker (gold)
      const endIcon = L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;background:#d4af37;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.6)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      L.marker(geometry[0], { icon: startIcon })
        .bindPopup(`<strong>Pickup</strong><br/>${pickupName}`)
        .addTo(map);

      L.marker(geometry[geometry.length - 1], { icon: endIcon })
        .bindPopup(`<strong>Destination</strong><br/>${destName}`)
        .addTo(map);

      // Fit map to route bounds
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [geometry, pickupName, destName]);

  return (
    <div ref={mapRef} className="w-full h-64 rounded-xl overflow-hidden" />
  );
}
