"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const TrackMap = dynamic(() => import("@/components/TrackMap"), { ssr: false });

interface BookingInfo {
  id: string;
  clientName: string;
  clientPhone: string;
  pickup: string;
  destination: string;
  date: string | null;
  time: string | null;
  vehicle: string;
  passengers: number;
  notes: string | null;
  status: string;
  totalPrice: number;
  driverOnline: boolean;
  clientLat: number | null;
  clientLon: number | null;
  clientOnline: boolean;
}

const VEHICLE_LABELS: Record<string, string> = {
  economy: "Economy — E-Class",
  business: "Business — S-Class",
  luxury: "Luxury — V-Class / SUV",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-400",
  OFFER_SENT: "text-blue-400",
  CONFIRMED: "text-green-400",
  REJECTED: "text-red-400",
  CANCELLED: "text-gray-400",
};

export default function DriverPage() {
  const { driverToken } = useParams<{ driverToken: string }>();

  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [geoError, setGeoError] = useState("");
  const [lastSent, setLastSent] = useState<Date | null>(null);

  const watchIdRef = useRef<number | null>(null);

  // Load booking info and keep polling for client location updates
  useEffect(() => {
    const fetchBooking = () => {
      fetch(`/api/driver/booking?token=${driverToken}`)
        .then((r) => {
          if (!r.ok) {
            setNotFound(true);
            return null;
          }
          return r.json();
        })
        .then((data) => {
          if (data) setBooking(data);
        });
    };

    fetchBooking();
    const id = setInterval(fetchBooking, 5000);
    return () => clearInterval(id);
  }, [driverToken]);

  const sendLocation = useCallback(
    async (lat: number, lon: number) => {
      await fetch("/api/driver/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverToken, lat, lon }),
      });
      setLastSent(new Date());
    },
    [driverToken],
  );

  const startSharing = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoError("");
    setSharing(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setPosition({ lat, lon });
        sendLocation(lat, lon);
      },
      (err) => {
        setGeoError(`GPS error: ${err.message}`);
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );
  };

  const stopSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
    setPosition(null);
    fetch("/api/driver/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverToken, offline: true }),
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        fetch("/api/driver/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ driverToken, offline: true }),
        });
      }
    };
  }, [driverToken]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🚫</p>
          <h1 className="text-2xl font-bold text-white mb-2">
            Panel Not Found
          </h1>
          <p className="text-white/50">
            This driver panel link is invalid or expired.
          </p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="bg-[#111] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚖</span>
          <div>
            <h1 className="font-bold text-white">Driver Panel</h1>
            <p className="text-xs text-white/40">
              Booking #{booking.id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
        <span
          className={`text-sm font-semibold ${STATUS_COLORS[booking.status] ?? "text-white/60"}`}
        >
          {booking.status}
        </span>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Booking Details */}
        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="font-semibold text-white/80 text-sm uppercase tracking-wider">
              Booking Details
            </h2>
          </div>
          <div className="p-5 space-y-3">
            <Row icon="👤" label="Client" value={booking.clientName} />
            <Row
              icon="📞"
              label="Phone"
              value={
                <a
                  href={`tel:${booking.clientPhone}`}
                  className="text-[#d4af37]"
                >
                  {booking.clientPhone}
                </a>
              }
            />
            <Row icon="📍" label="Pickup" value={booking.pickup} />
            <Row icon="🏁" label="Destination" value={booking.destination} />
            {booking.date && (
              <Row icon="📅" label="Date" value={booking.date} />
            )}
            {booking.time && (
              <Row icon="🕐" label="Time" value={booking.time} />
            )}
            <Row
              icon="🚗"
              label="Vehicle"
              value={VEHICLE_LABELS[booking.vehicle] ?? booking.vehicle}
            />
            <Row icon="👥" label="Passengers" value={`${booking.passengers}`} />
            {booking.notes && (
              <Row icon="📝" label="Notes" value={booking.notes} />
            )}
            {booking.totalPrice > 0 && (
              <Row
                icon="💎"
                label="Total"
                value={`€${booking.totalPrice.toFixed(2)}`}
                gold
              />
            )}
          </div>
        </div>

        {/* Location Sharing */}
        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white/80 text-sm uppercase tracking-wider">
              Live Location
            </h2>
            <div
              className={`flex items-center gap-2 text-sm font-medium ${sharing ? "text-green-400" : "text-white/30"}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${sharing ? "bg-green-400 animate-pulse" : "bg-white/20"}`}
              />
              {sharing ? "Sharing" : "Offline"}
            </div>
          </div>
          <div className="p-5 space-y-4">
            {geoError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                {geoError}
              </div>
            )}

            {!sharing ? (
              <button
                onClick={startSharing}
                className="w-full py-4 rounded-xl bg-[#d4af37] text-black font-bold text-lg hover:bg-[#c49b30] transition-colors"
              >
                🟢 Start Sharing Location
              </button>
            ) : (
              <button
                onClick={stopSharing}
                className="w-full py-4 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-colors"
              >
                🔴 Stop Sharing
              </button>
            )}

            {position && (
              <p className="text-center text-xs text-white/30">
                GPS: {position.lat.toFixed(5)}, {position.lon.toFixed(5)}
                {lastSent && ` · Sent ${lastSent.toLocaleTimeString()}`}
              </p>
            )}
          </div>
        </div>

        {/* Map */}
        {sharing && position && (
          <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white/80 text-sm uppercase tracking-wider">
                Live Map
              </h2>
              {booking.clientOnline && (
                <div className="flex items-center gap-2 text-xs text-green-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Client sharing location
                </div>
              )}
            </div>
            <div style={{ height: 320 }}>
              <TrackMap
                lat={position.lat}
                lon={position.lon}
                clientLat={booking.clientOnline ? booking.clientLat : null}
                clientLon={booking.clientOnline ? booking.clientLon : null}
              />
            </div>
          </div>
        )}

        {/* Client location (when client is sharing but driver map is not visible) */}
        {!sharing && booking.clientOnline && booking.clientLat != null && booking.clientLon != null && (
          <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white/80 text-sm uppercase tracking-wider">
                Client Location
              </h2>
              <div className="flex items-center gap-2 text-xs text-green-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live
              </div>
            </div>
            <div style={{ height: 280 }}>
              <TrackMap lat={booking.clientLat} lon={booking.clientLon} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  gold,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
  gold?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <span className="text-base w-5 shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-white/40 uppercase tracking-wider block">
          {label}
        </span>
        <span
          className={`text-sm break-words ${gold ? "text-[#d4af37] font-bold" : "text-white/80"}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
