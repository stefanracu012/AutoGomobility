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
  bookingType: string;
  hours: number | null;
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

// ── SVG icons ────────────────────────────────────────────────────────────────

function IconUser() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white/40 shrink-0"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white/40 shrink-0"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17l.92-.08Z" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white/40 shrink-0"
    >
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconFlag() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white/40 shrink-0"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white/40 shrink-0"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white/40 shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconCar() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white/40 shrink-0"
    >
      <path d="M19 17H5a2 2 0 0 1-2-2v-1l2.68-6.26A2 2 0 0 1 7.52 6h8.96a2 2 0 0 1 1.84 1.74L21 14v1a2 2 0 0 1-2 2Z" />
      <circle cx="7.5" cy="17" r="2" />
      <circle cx="16.5" cy="17" r="2" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white/40 shrink-0"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconNote() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white/40 shrink-0"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconDiamond() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#d4af37] shrink-0"
    >
      <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0Z" />
    </svg>
  );
}

function IconTaxi() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#d4af37]"
    >
      <path d="M19 17H5a2 2 0 0 1-2-2v-1l2.68-6.26A2 2 0 0 1 7.52 6h8.96a2 2 0 0 1 1.84 1.74L21 14v1a2 2 0 0 1-2 2Z" />
      <circle cx="7.5" cy="17" r="2" />
      <circle cx="16.5" cy="17" r="2" />
      <path d="M9 6V3" />
      <path d="M15 6V3" />
    </svg>
  );
}

function IconSignal({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={active ? "text-green-400" : "text-white/30"}
    >
      <path d="M2 12a10 10 0 0 1 20 0" />
      <path d="M6 16a6 6 0 0 1 12 0" />
      <circle cx="12" cy="20" r="2" fill="currentColor" />
    </svg>
  );
}

function IconStopCircle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}

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
        if (err.code === 1) {
          setGeoError("PERMISSION_DENIED");
        } else if (err.code === 2) {
          setGeoError(
            "Location unavailable. Make sure GPS is enabled on your device.",
          );
        } else {
          setGeoError("Location request timed out. Please try again.");
        }
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
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
          <IconTaxi />
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
            <Row
              icon={<IconUser />}
              label="Client"
              value={booking.clientName}
            />
            <Row
              icon={<IconPhone />}
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
            <Row icon={<IconPin />} label="Pickup" value={booking.pickup} />
            {booking.bookingType === "hourly" ? (
              <Row
                icon={<IconClock />}
                label="Duration"
                value={`${booking.hours ?? "?"} hour${(booking.hours ?? 0) !== 1 ? "s" : ""}`}
              />
            ) : (
              <Row
                icon={<IconFlag />}
                label="Destination"
                value={booking.destination}
              />
            )}
            {booking.date && (
              <Row icon={<IconCalendar />} label="Date" value={booking.date} />
            )}
            {booking.time && (
              <Row icon={<IconClock />} label="Time" value={booking.time} />
            )}
            <Row
              icon={<IconCar />}
              label="Vehicle"
              value={VEHICLE_LABELS[booking.vehicle] ?? booking.vehicle}
            />
            <Row
              icon={<IconUsers />}
              label="Passengers"
              value={`${booking.passengers}`}
            />
            {booking.notes && (
              <Row icon={<IconNote />} label="Notes" value={booking.notes} />
            )}
            {booking.totalPrice > 0 && (
              <Row
                icon={<IconDiamond />}
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
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 space-y-1">
                {geoError === "PERMISSION_DENIED" ? (
                  <>
                    <p className="font-semibold">Location access was denied.</p>
                    <div className="text-red-400/70 text-xs leading-relaxed space-y-2 mt-1">
                      <p><strong className="text-red-400">iPhone / iPad:</strong> Go to <strong>Settings → Privacy &amp; Security → Location Services</strong>, find your browser (Safari / Chrome), set it to <strong>While Using</strong>. Then refresh.</p>
                      <p><strong className="text-red-400">Android:</strong> Tap the <strong>lock icon</strong> in the address bar → <strong>Permissions → Location → Allow</strong>. Then refresh.</p>
                      <p><strong className="text-red-400">Desktop:</strong> Click the lock icon in the address bar → <strong>Site settings → Location → Allow</strong>. Then refresh.</p>
                    </div>
                  </>
                ) : (
                  <p>{geoError}</p>
                )}
              </div>
            )}

            {!sharing ? (
              <button
                onClick={startSharing}
                className="w-full py-4 rounded-xl bg-[#d4af37] text-black font-bold text-lg hover:bg-[#c49b30] transition-colors flex items-center justify-center gap-2"
              >
                <IconSignal active={false} />
                Start Sharing Location
              </button>
            ) : (
              <button
                onClick={stopSharing}
                className="w-full py-4 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <IconStopCircle />
                Stop Sharing
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
        {!sharing &&
          booking.clientOnline &&
          booking.clientLat != null &&
          booking.clientLon != null && (
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
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  gold?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <span className="w-5 shrink-0 mt-0.5 flex items-center justify-center">
        {icon}
      </span>
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
