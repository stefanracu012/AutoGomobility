"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface TrackMapProps {
  lat: number | null;
  lon: number | null;
  clientLat?: number | null;
  clientLon?: number | null;
}

export default function TrackMap({
  lat,
  lon,
  clientLat,
  clientLon,
}: TrackMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const clientMarkerRef = useRef<L.Marker | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] =
      lat != null && lon != null ? [lat, lon] : [53.3498, -6.2603];

    const map = L.map(containerRef.current, { zoomAnimation: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
    map.setView(center, 14);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      clientMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update driver marker position whenever lat/lon changes
  useEffect(() => {
    if (!mapRef.current || lat == null || lon == null) return;

    const icon = L.divIcon({
      html: `<span style="font-size:30px;line-height:1;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.8))">🚖</span>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: "",
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
      mapRef.current.panTo([lat, lon], { animate: true, duration: 1 });
    } else {
      markerRef.current = L.marker([lat, lon], { icon })
        .addTo(mapRef.current)
        .bindPopup("🚖 Driver");
      mapRef.current.setView([lat, lon], 15);
    }
  }, [lat, lon]);

  // Update client marker whenever clientLat/clientLon changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (clientLat == null || clientLon == null) {
      if (clientMarkerRef.current) {
        clientMarkerRef.current.remove();
        clientMarkerRef.current = null;
      }
      return;
    }

    const icon = L.divIcon({
      html: `<span style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.8))">👤</span>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: "",
    });

    if (clientMarkerRef.current) {
      clientMarkerRef.current.setLatLng([clientLat, clientLon]);
    } else {
      clientMarkerRef.current = L.marker([clientLat, clientLon], { icon })
        .addTo(mapRef.current)
        .bindPopup("👤 Client");
    }
  }, [clientLat, clientLon]);

  return (
    <div
      ref={containerRef}
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
    />
  );
}
