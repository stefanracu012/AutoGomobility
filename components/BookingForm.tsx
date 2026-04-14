"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { CalendarPicker, TimePicker } from "@/components/DateTimePicker";

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });
import { calculatePrice, type PricingRates } from "@/lib/price";

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (!query || query.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      { headers: { "Accept-Language": "en" } },
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

interface RouteResult {
  geometry: [number, number][];
  distanceKm: number;
  durationMin: number;
}

async function fetchRoute(
  pickupLat: string,
  pickupLon: string,
  destLat: string,
  destLon: string,
): Promise<RouteResult | null> {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${pickupLon},${pickupLat};${destLon},${destLat}?overview=full&geometries=geojson`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.routes?.length > 0) {
      const route = data.routes[0];
      const geometry = (route.geometry.coordinates as [number, number][]).map(
        ([lon, lat]) => [lat, lon] as [number, number],
      );
      return {
        geometry,
        distanceKm: route.distance / 1000,
        durationMin: Math.round(route.duration / 60),
      };
    }
    return null;
  } catch {
    return null;
  }
}

type VehicleType = "economy" | "business" | "luxury";

export default function BookingForm() {
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    pickup: searchParams.get("pickup") ?? "",
    destination: searchParams.get("destination") ?? "",
    vehicle: (searchParams.get("vehicle") ?? "business") as VehicleType,
    passengers: searchParams.get("passengers") ?? "1",
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [routeGeometry, setRouteGeometry] = useState<[number, number][] | null>(
    null,
  );

  // Autocomplete states
  const [pickupSuggestions, setPickupSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [destSuggestions, setDestSuggestions] = useState<LocationSuggestion[]>(
    [],
  );
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [pickupCoords, setPickupCoords] = useState<{
    lat: string;
    lon: string;
  } | null>(null);
  const [destCoords, setDestCoords] = useState<{
    lat: string;
    lon: string;
  } | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [pricingRates, setPricingRates] = useState<PricingRates | null>(null);

  const pickupRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pickupLat = searchParams.get("pickupLat");
  const pickupLon = searchParams.get("pickupLon");
  const destLat = searchParams.get("destLat");
  const destLon = searchParams.get("destLon");

  // Init coords from URL params
  useEffect(() => {
    if (pickupLat && pickupLon)
      setPickupCoords({ lat: pickupLat, lon: pickupLon });
    if (destLat && destLon) setDestCoords({ lat: destLat, lon: destLon });
  }, [pickupLat, pickupLon, destLat, destLon]);

  // Fetch pricing rates for live estimate
  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then(setPricingRates)
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickupRef.current &&
        !pickupRef.current.contains(event.target as Node)
      ) {
        setShowPickupDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch route when coords are available
  useEffect(() => {
    const pCoords =
      pickupCoords ??
      (pickupLat && pickupLon ? { lat: pickupLat, lon: pickupLon } : null);
    const dCoords =
      destCoords ??
      (destLat && destLon ? { lat: destLat, lon: destLon } : null);
    if (pCoords && dCoords) {
      fetchRoute(pCoords.lat, pCoords.lon, dCoords.lat, dCoords.lon).then(
        (result) => {
          if (result) {
            setRouteGeometry(result.geometry);
            setRouteInfo({ distanceKm: result.distanceKm, durationMin: result.durationMin });
          } else {
            setRouteGeometry(null);
            setRouteInfo(null);
          }
        },
      );
    } else {
      setRouteGeometry(null);
      setRouteInfo(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupCoords, destCoords, pickupLat, pickupLon, destLat, destLon]);

  // Recalculate live price when route or vehicle changes
  useEffect(() => {
    if (!routeInfo) { setLivePrice(null); return; }
    setLivePrice(
      calculatePrice({
        distance: routeInfo.distanceKm,
        vehicle: form.vehicle,
        rates: pricingRates ?? undefined,
      }),
    );
  }, [routeInfo, form.vehicle, pricingRates]);

  // Debounced Nominatim search for pickup
  const handlePickupSearch = useCallback((value: string) => {
    setForm((f) => ({ ...f, pickup: value }));
    setPickupCoords(null);
    setRouteInfo(null);
    setLivePrice(null);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.length >= 3) {
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocations(value);
        setPickupSuggestions(results);
        setShowPickupDropdown(results.length > 0);
      }, 300);
    } else {
      setPickupSuggestions([]);
      setShowPickupDropdown(false);
    }
  }, []);

  // Debounced Nominatim search for destination
  const handleDestSearch = useCallback((value: string) => {
    setForm((f) => ({ ...f, destination: value }));
    setDestCoords(null);
    setRouteInfo(null);
    setLivePrice(null);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.length >= 3) {
      searchTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocations(value);
        setDestSuggestions(results);
        setShowDestDropdown(results.length > 0);
      }, 300);
    } else {
      setDestSuggestions([]);
      setShowDestDropdown(false);
    }
  }, []);

  // Select suggestion
  const selectPickup = (s: LocationSuggestion) => {
    setForm((f) => ({ ...f, pickup: s.display_name }));
    setPickupCoords({ lat: s.lat, lon: s.lon });
    setShowPickupDropdown(false);
    setPickupSuggestions([]);
  };

  const selectDest = (s: LocationSuggestion) => {
    setForm((f) => ({ ...f, destination: s.display_name }));
    setDestCoords({ lat: s.lat, lon: s.lon });
    setShowDestDropdown(false);
    setDestSuggestions([]);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const estimatedPrice =
      searchParams.get("price") ??
      (livePrice !== null ? livePrice.toFixed(2) : undefined);

    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: estimatedPrice ?? undefined }),
      });

      if (!res.ok) throw new Error("Failed to submit booking");

      setSubmitted(true);
    } catch {
      setError("Failed to submit your booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-accent/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Cerere trimisă!</h2>
        <p className="text-muted mb-3">
          Mulțumim! Cererea a fost înregistrată. Șoferul va reveni cu o ofertă
          personalizată.
        </p>
        <p className="text-xs text-white/40">
          Prețul afișat anterior este orientativ — oferta finală va fi transmisă
          pe email.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors";

  const selectClass =
    "w-full appearance-none bg-[#111] border border-white/10 rounded-2xl px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors cursor-pointer";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Book Your Ride</h2>

      {/* Estimated price banner — shows from URL params or live calculation */}
      {(livePrice !== null || searchParams.get("price")) && (
        <div className="mb-6 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">
                Preț estimativ
              </p>
              <p className="text-3xl font-bold text-accent">
                €{
                  livePrice !== null
                    ? livePrice.toFixed(2)
                    : parseFloat(searchParams.get("price")!).toFixed(2)
                }
              </p>
            </div>
            {routeInfo && (
              <div className="flex gap-5 text-sm">
                <div className="text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Distanță</p>
                  <p className="font-semibold text-white">{Math.round(routeInfo.distanceKm)} km</p>
                </div>
                <div className="text-center">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">Durată est.</p>
                  <p className="font-semibold text-white">
                    {routeInfo.durationMin >= 60
                      ? `${Math.floor(routeInfo.durationMin / 60)}h ${routeInfo.durationMin % 60}min`
                      : `${routeInfo.durationMin} min`}
                  </p>
                </div>
              </div>
            )}
            <div className="text-xs text-white/40 leading-relaxed max-w-[200px] text-right">
              Preț orientativ.
              <br />
              <span className="text-white/60">
                Oferta finală e trimisă pe email.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Route map preview */}
      {routeGeometry && (
        <div className="mb-6 rounded-xl overflow-hidden">
          <RouteMap
            geometry={routeGeometry}
            pickupName={form.pickup}
            destName={form.destination}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={inputClass}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className={inputClass}
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            required
            value={form.phone}
            onChange={handleChange}
            placeholder="+373 000 000 00"
            className={inputClass}
          />
        </div>

        {/* Date & Time — custom pickers */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Pickup Date &amp; Time
          </label>
          <div className="grid grid-cols-2 gap-0 rounded-2xl border border-white/10 bg-white/[0.03] focus-within:border-accent/30 transition-colors divide-x divide-white/10">
            <CalendarPicker
              value={form.date}
              onChange={(val) => setForm((f) => ({ ...f, date: val }))}
            />
            <TimePicker
              value={form.time}
              onChange={(val) => setForm((f) => ({ ...f, time: val }))}
            />
          </div>
        </div>

        {/* Vehicle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Vehicle
          </label>
          <div className="relative">
            <select
              name="vehicle"
              value={form.vehicle}
              onChange={handleChange}
              className={selectClass}
            >
              <option value="economy" className="bg-[#111] text-white">
                Economy — E-Class
              </option>
              <option value="business" className="bg-[#111] text-white">
                Business — S-Class
              </option>
              <option value="luxury" className="bg-[#111] text-white">
                Luxury — V-Class / SUV
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                className="w-4 h-4 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Passengers
          </label>
          <div className="relative">
            <select
              name="passengers"
              value={form.passengers}
              onChange={handleChange}
              className={selectClass}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option
                  key={n}
                  value={String(n)}
                  className="bg-[#111] text-white"
                >
                  {n} {n === 1 ? "passenger" : "passengers"}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                className="w-4 h-4 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Pickup */}
        <div className="flex flex-col gap-1.5" ref={pickupRef}>
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Pickup Location
          </label>
          <div className="relative">
            <input
              type="text"
              name="pickup"
              required
              value={form.pickup}
              onChange={(e) => handlePickupSearch(e.target.value)}
              onFocus={() =>
                pickupSuggestions.length > 0 && setShowPickupDropdown(true)
              }
              placeholder="Start typing to search..."
              className={inputClass}
              autoComplete="off"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            {showPickupDropdown && pickupSuggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                {pickupSuggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectPickup(s)}
                    className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 cursor-pointer"
                  >
                    <span className="line-clamp-2">{s.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Destination */}
        <div className="flex flex-col gap-1.5" ref={destRef}>
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Destination
          </label>
          <div className="relative">
            <input
              type="text"
              name="destination"
              required
              value={form.destination}
              onChange={(e) => handleDestSearch(e.target.value)}
              onFocus={() =>
                destSuggestions.length > 0 && setShowDestDropdown(true)
              }
              placeholder="Start typing to search..."
              className={inputClass}
              autoComplete="off"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            {showDestDropdown && destSuggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                {destSuggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectDest(s)}
                    className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 cursor-pointer"
                  >
                    <span className="line-clamp-2">{s.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Special requests, luggage info, etc."
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-400 text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full bg-accent hover:bg-accent-hover text-black font-semibold py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
      >
        {loading ? "Submitting..." : "Confirm Booking"}
      </button>
    </form>
  );
}
