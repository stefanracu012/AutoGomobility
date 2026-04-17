"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { calculatePrice } from "@/lib/price";
import { useTranslation } from "@/components/LanguageProvider";

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });

type VehicleType = "economy" | "business" | "luxury";

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

interface RouteResult {
  distance: number; // km
  duration: number; // minutes
  geometry: [number, number][]; // [lat, lon] pairs
}

// Nominatim API for geocoding (FREE - OpenStreetMap)
async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (!query || query.length < 3) return [];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
        },
      },
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// OSRM API for routing (FREE - OpenStreetMap)
async function getRoute(
  originLat: string,
  originLon: string,
  destLat: string,
  destLon: string,
): Promise<RouteResult | null> {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=full&geometries=geojson`,
    );
    if (!res.ok) return null;
    const data = await res.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      // GeoJSON coords are [lon, lat] — flip to [lat, lon] for Leaflet
      const geometry = (route.geometry.coordinates as [number, number][]).map(
        ([lon, lat]) => [lat, lon] as [number, number],
      );
      return {
        distance: Math.round((route.distance / 1000) * 10) / 10,
        duration: Math.round(route.duration / 60),
        geometry,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

interface QuickLocation {
  id: string;
  name: string;
  lat: string;
  lon: string;
}

export default function BookingCalculator() {
  const { t } = useTranslation();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicle, setVehicle] = useState<VehicleType>("business");
  const [passengers, setPassengers] = useState("");
  const [hours, setHours] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);
  const [quickLocations, setQuickLocations] = useState<QuickLocation[]>([]);

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

  const pickupRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch quick locations from admin-managed settings
  useEffect(() => {
    fetch("/api/locations")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: QuickLocation[]) => setQuickLocations(data))
      .catch(() => {});
  }, []);

  // Close dropdowns when clicking outside
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

  // Debounced search for pickup
  const handlePickupChange = useCallback((value: string) => {
    setPickup(value);
    setPickupCoords(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

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

  // Debounced search for destination
  const handleDestChange = useCallback((value: string) => {
    setDestination(value);
    setDestCoords(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

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

  // Select pickup suggestion
  const selectPickup = (suggestion: LocationSuggestion) => {
    setPickup(suggestion.display_name);
    setPickupCoords({ lat: suggestion.lat, lon: suggestion.lon });
    setShowPickupDropdown(false);
    setPickupSuggestions([]);
  };

  // Select destination suggestion
  const selectDest = (suggestion: LocationSuggestion) => {
    setDestination(suggestion.display_name);
    setDestCoords({ lat: suggestion.lat, lon: suggestion.lon });
    setShowDestDropdown(false);
    setDestSuggestions([]);
  };

  // Calculate route
  const calculateRoute = useCallback(async () => {
    if (!pickupCoords || !destCoords) {
      setError("Please select locations from the dropdown suggestions");
      return;
    }

    setLoading(true);
    setError("");
    setRouteInfo(null);
    setPrice(null);

    try {
      const route = await getRoute(
        pickupCoords.lat,
        pickupCoords.lon,
        destCoords.lat,
        destCoords.lon,
      );

      if (!route) {
        setError(t.calc.errRoute);
        setLoading(false);
        return;
      }

      setRouteInfo(route);

      // Calculate price
      const result = calculatePrice({
        distance: route.distance,
        vehicle,
        hours: hours ? parseFloat(hours) : undefined,
      });

      setPrice(Math.round(result * 100) / 100);
    } catch {
      setError(t.calc.errCalc);
    } finally {
      setLoading(false);
    }
  }, [pickupCoords, destCoords, vehicle, hours]);

  // Recalculate price when vehicle or hours change
  useEffect(() => {
    if (routeInfo) {
      const result = calculatePrice({
        distance: routeInfo.distance,
        vehicle,
        hours: hours ? parseFloat(hours) : undefined,
      });
      setPrice(Math.round(result * 100) / 100);
    }
  }, [vehicle, hours, routeInfo]);

  const handleCalculate = () => {
    if (!pickup || !destination) {
      setError(t.calc.errBoth);
      return;
    }
    if (!pickupCoords || !destCoords) {
      setError(t.calc.errSelect);
      return;
    }
    calculateRoute();
  };

  const vehicles: { value: VehicleType; label: string; desc: string }[] = [
    { value: "economy", label: t.calc.economy, desc: t.calc.eClass },
    { value: "business", label: t.calc.business, desc: t.calc.sClass },
    { value: "luxury", label: t.calc.luxury, desc: t.calc.vClass },
  ];

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-3 py-3 sm:px-5 sm:py-4 text-sm sm:text-base text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-colors";

  const dropdownClass =
    "absolute z-50 top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden";

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">
        {t.calc.heading}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pickup */}
        <div className="flex flex-col gap-1.5" ref={pickupRef}>
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            {t.calc.pickupLocation}
          </label>
          <div className="relative">
            <input
              type="text"
              value={pickup}
              onChange={(e) => handlePickupChange(e.target.value)}
              onFocus={() =>
                pickupSuggestions.length > 0 && setShowPickupDropdown(true)
              }
              placeholder={t.calc.searchPh}
              className={inputClass}
              autoComplete="off"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30"
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
              <div className={dropdownClass}>
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
            {t.calc.destination}
          </label>
          <div className="relative">
            <input
              type="text"
              value={destination}
              onChange={(e) => handleDestChange(e.target.value)}
              onFocus={() =>
                destSuggestions.length > 0 && setShowDestDropdown(true)
              }
              placeholder={t.calc.searchPh}
              className={inputClass}
              autoComplete="off"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30"
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
              <div className={dropdownClass}>
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
          {/* Top destinations chips */}
          {!destination && quickLocations.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {quickLocations.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setDestination(d.name);
                    setDestCoords({ lat: d.lat, lon: d.lon });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-accent bg-white/[0.04] hover:bg-accent/10 border border-white/10 hover:border-accent/30 px-3 py-1.5 rounded-full transition-all duration-200"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
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
                  {d.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            {t.calc.vehicleType}
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {vehicles.map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => setVehicle(v.value)}
                className={`rounded-xl sm:rounded-2xl border px-2 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  vehicle === v.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-white/10 bg-white/5 text-muted hover:border-white/20"
                }`}
              >
                <span className="block">{v.label}</span>
                <span className="block text-xs opacity-60 mt-0.5">
                  {v.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Hours */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            {t.calc.hoursLabel}
          </label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder={t.calc.hoursPh}
            min="0"
            className={inputClass}
          />
        </div>

        {/* Passengers */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted uppercase tracking-wider">
            {t.calc.passengersLabel}
          </label>
          <input
            type="number"
            value={passengers}
            onChange={(e) => setPassengers(e.target.value)}
            placeholder={t.calc.passengersPh}
            min="1"
            max="8"
            className={inputClass}
          />
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-400 text-center">{error}</p>}

      {/* Calculate button */}
      <button
        onClick={handleCalculate}
        disabled={loading || !pickup || !destination}
        className="mt-6 w-full bg-accent hover:bg-accent-hover text-black font-semibold py-3.5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
      >
        {loading ? t.calc.calculating : t.calc.calculatePrice}
      </button>

      {/* Price result */}
      {routeInfo && price !== null && (
        <div className="bg-accent/10 border border-accent/20 rounded-2xl py-5 px-4">
          <div className="flex items-center justify-center gap-3 mb-4 text-sm">
            <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5">
              <svg
                className="w-4 h-4 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                />
              </svg>
              <span className="text-white font-medium">
                {routeInfo.distance} km
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5">
              <svg
                className="w-4 h-4 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-white font-medium">
                {formatDuration(routeInfo.duration)}
              </span>
            </div>
          </div>
          {/* Map */}
          <div className="my-4">
            <RouteMap
              geometry={routeInfo.geometry}
              pickupName={pickup}
              destName={destination}
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-muted mb-1">{t.calc.estimatedPrice}</p>
            <p className="text-4xl font-bold text-accent">
              CHF {price.toFixed(2)}
            </p>
            <p className="text-xs text-white/40 mt-2">{t.calc.priceNote}</p>
          </div>
          <Link
            href={`/booking?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}&vehicle=${vehicle}${passengers ? `&passengers=${encodeURIComponent(passengers)}` : ""}&price=${price.toFixed(2)}${pickupCoords ? `&pickupLat=${pickupCoords.lat}&pickupLon=${pickupCoords.lon}` : ""}${destCoords ? `&destLat=${destCoords.lat}&destLon=${destCoords.lon}` : ""}`}
            className="block mt-4 w-full bg-accent hover:bg-accent-hover text-black font-semibold py-3 rounded-2xl text-center transition-all hover:scale-[1.02]"
          >
            {t.calc.proceedToBooking}
          </Link>
        </div>
      )}
    </div>
  );
}
