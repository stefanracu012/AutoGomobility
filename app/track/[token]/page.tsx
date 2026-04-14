"use client";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const TrackMap = dynamic(() => import("@/components/TrackMap"), { ssr: false });

interface TrackData {
  online: boolean;
  lat: number | null;
  lon: number | null;
  pickup: string;
  destination: string;
  clientName: string;
  status: string;
  bookingId: string;
  bookingType: string;
  hours: number | null;
}

// ── SVG icons ────────────────────────────────────────────────────────────────

function IconMail({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconCheckCircle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconXCircle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function IconBan({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

function IconCar({ className }: { className?: string }) {
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
      className={className}
    >
      <path d="M19 17H5a2 2 0 0 1-2-2v-1l2.68-6.26A2 2 0 0 1 7.52 6h8.96a2 2 0 0 1 1.84 1.74L21 14v1a2 2 0 0 1-2 2Z" />
      <circle cx="7.5" cy="17" r="2" />
      <circle cx="16.5" cy="17" r="2" />
    </svg>
  );
}

function IconPin({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconExternalLink() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ── Status map ────────────────────────────────────────────────────────────────

type StatusInfo = { text: string; icon: ReactNode; color: string };

function getStatusInfo(status: string): StatusInfo {
  switch (status) {
    case "PENDING":
      return {
        text: "Awaiting driver confirmation",
        icon: <IconClock className="text-yellow-400" />,
        color: "text-yellow-400",
      };
    case "OFFER_SENT":
      return {
        text: "Offer sent — confirm or decline below",
        icon: <IconMail className="text-blue-400" />,
        color: "text-blue-400",
      };
    case "CONFIRMED":
      return {
        text: "Booking confirmed!",
        icon: <IconCheckCircle className="text-green-400" />,
        color: "text-green-400",
      };
    case "REJECTED":
      return {
        text: "Booking declined",
        icon: <IconXCircle className="text-red-400" />,
        color: "text-red-400",
      };
    case "CANCELLED":
      return {
        text: "Booking cancelled",
        icon: <IconBan className="text-gray-400" />,
        color: "text-gray-400",
      };
    default:
      return {
        text: status,
        icon: <IconPin className="text-white/40" />,
        color: "text-white/60",
      };
  }
}

function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export default function TrackPage() {
  const { token } = useParams<{ token: string }>();

  const [data, setData] = useState<TrackData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Client location sharing
  const [sharing, setSharing] = useState(false);
  const [geoError, setGeoError] = useState("");

  // Confirm / Decline
  const [actionLoading, setActionLoading] = useState<
    "confirm" | "decline" | null
  >(null);
  const [actionError, setActionError] = useState("");
  const watchIdRef = useRef<number | null>(null);

  const handleConfirm = async () => {
    if (!token || actionLoading) return;
    setActionLoading("confirm");
    setActionError("");
    try {
      const res = await fetch(`/api/bookings/confirm?token=${token}`);
      if (res.ok || res.redirected) {
        setData((d) => (d ? { ...d, status: "CONFIRMED" } : d));
      } else {
        const text = await res.text();
        setActionError(
          text.includes("already")
            ? "Already processed."
            : "Could not confirm. Please try again.",
        );
      }
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    if (!token || actionLoading) return;
    setActionLoading("decline");
    setActionError("");
    try {
      const res = await fetch(`/api/bookings/reject?token=${token}`);
      if (res.ok || res.redirected) {
        setData((d) => (d ? { ...d, status: "REJECTED" } : d));
      } else {
        setActionError("Could not decline. Please try again.");
      }
    } catch {
      setActionError("Network error. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const sendClientLocation = useCallback(
    async (lat: number, lon: number) => {
      await fetch("/api/client/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, lat, lon }),
      });
    },
    [token],
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
        sendClientLocation(lat, lon);
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
    fetch("/api/client/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, offline: true }),
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        fetch("/api/client/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, offline: true }),
        });
      }
    };
  }, [token]);

  const poll = async () => {
    const res = await fetch(`/api/track?token=${token}`);
    if (!res.ok) {
      setNotFound(true);
      return;
    }
    const json = await res.json();
    setData(json);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center px-6">
          <IconSearch className="text-white/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Booking Not Found
          </h1>
          <p className="text-white/50">
            This tracking link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusInfo = getStatusInfo(data.status);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="bg-[#111] border-b border-white/10 px-6 py-5 text-center">
        <p className="text-xs text-[#d4af37] font-semibold uppercase tracking-widest mb-1">
          Premium Chauffeur Service
        </p>
        <h1 className="text-xl font-bold">Live Tracking</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Booking #{data.bookingId.slice(-6).toUpperCase()}
        </p>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-5">
        {/* Status */}
        <div className="bg-[#111] border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="shrink-0">{statusInfo.icon}</div>
          <div>
            <p className={`font-semibold ${statusInfo.color}`}>
              {statusInfo.text}
            </p>
            {lastUpdated && (
              <p className="text-xs text-white/30 mt-0.5">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>

        {/* Confirm / Decline — shown when offer is waiting for client response */}
        {data.status === "OFFER_SENT" && (
          <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Your Response
              </p>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-white/60 mb-4">
                The driver has sent you a personalised offer. Please confirm or
                decline below.
              </p>
              {actionError && (
                <p className="text-xs text-red-400 text-center">
                  {actionError}
                </p>
              )}
              <button
                onClick={handleConfirm}
                disabled={!!actionLoading}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#d4af37] text-black font-bold text-sm hover:bg-[#c49b30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === "confirm" ? (
                  <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
                {actionLoading === "confirm"
                  ? "Confirming..."
                  : "Confirm Booking"}
              </button>
              <button
                onClick={handleDecline}
                disabled={!!actionLoading}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-transparent border border-white/15 text-white/60 font-medium text-sm hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === "decline" ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                ) : (
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
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
                {actionLoading === "decline" ? "Declining..." : "Decline Offer"}
              </button>
            </div>
          </div>
        )}

        {/* Driver status */}
        <div className="bg-[#111] border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconCar className="text-[#d4af37]" />
            <span className="text-sm font-medium text-white/80">
              Driver Location
            </span>
          </div>
          <div
            className={`flex items-center gap-2 text-sm font-semibold ${data.online ? "text-green-400" : "text-white/30"}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${data.online ? "bg-green-400 animate-pulse" : "bg-white/20"}`}
            />
            {data.online ? "Live" : "Offline"}
          </div>
        </div>

        {/* Share my location */}
        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconPin className="text-[#d4af37] w-5 h-5" />
              <span className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                Share My Location
              </span>
            </div>
            <div
              className={`flex items-center gap-2 text-sm font-medium ${sharing ? "text-green-400" : "text-white/30"}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${sharing ? "bg-green-400 animate-pulse" : "bg-white/20"}`}
              />
              {sharing ? "Sharing" : "Off"}
            </div>
          </div>
          <div className="px-5 py-4 space-y-3">
            {geoError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 space-y-1">
                {geoError === "PERMISSION_DENIED" ? (
                  <>
                    <p className="font-semibold">Location access was denied.</p>
                    <p className="text-red-400/70 text-xs leading-relaxed">
                      To fix this, open your browser settings, find this site
                      under Permissions → Location, and set it to{" "}
                      <strong>Allow</strong>. Then refresh the page and try
                      again.
                    </p>
                  </>
                ) : (
                  <p>{geoError}</p>
                )}
              </div>
            )}
            {!sharing ? (
              <button
                onClick={startSharing}
                className="w-full py-3 rounded-xl bg-[#d4af37] text-black font-bold text-sm hover:bg-[#c49b30] transition-colors"
              >
                📍 Share My Location with Driver
              </button>
            ) : (
              <button
                onClick={stopSharing}
                className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm hover:bg-white/20 transition-colors"
              >
                🔴 Stop Sharing
              </button>
            )}
            {sharing && (
              <p className="text-center text-xs text-white/30">
                Your location is being sent to the driver in real-time
              </p>
            )}
          </div>
        </div>

        {/* Map */}
        {data.online && data.lat != null && data.lon != null ? (
          <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
            <div style={{ height: 380 }}>
              <TrackMap lat={data.lat} lon={data.lon} />
            </div>
          </div>
        ) : (
          <div
            className="bg-[#111] border border-white/10 rounded-2xl flex items-center justify-center"
            style={{ height: 200 }}
          >
            <div className="text-center text-white/30">
              <IconPin className="mx-auto mb-2 text-white/20" />
              <p className="text-sm">Driver hasn&apos;t started sharing yet</p>
              <p className="text-xs mt-1">
                This page auto-refreshes every 5 seconds
              </p>
            </div>
          </div>
        )}

        {/* Route details */}
        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Your Journey
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-1 pt-1">
                <span className="w-3 h-3 rounded-full bg-green-400 shrink-0" />
                <span className="w-0.5 flex-1 bg-white/10" />
                <span className="w-3 h-3 rounded-full bg-[#d4af37] shrink-0" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">
                    Pickup
                  </p>
                  <p className="text-sm text-white/80">{data.pickup}</p>
                  <a
                    href={mapsUrl(data.pickup)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1.5 text-xs text-[#d4af37]/60 hover:text-[#d4af37] transition-colors"
                  >
                    Open in Google Maps
                    <IconExternalLink />
                  </a>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">
                    Destination
                  </p>
                  <p className="text-sm text-white/80">{data.destination}</p>
                  {data.bookingType !== "hourly" && (
                    <a
                      href={mapsUrl(data.destination)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1.5 text-xs text-[#d4af37]/60 hover:text-[#d4af37] transition-colors"
                    >
                      Open in Google Maps
                      <IconExternalLink />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
