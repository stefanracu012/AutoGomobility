"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Pricing {
  base: number;
  economy: number;
  business: number;
  luxury: number;
  economyPerHour: number;
  businessPerHour: number;
  luxuryPerHour: number;
}
interface FleetItem {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  priceLabel: string;
  passengers?: string;
  luggage?: string;
  features?: string[];
}
interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  tag: string;
  highlights?: string[];
  image?: string;
}
interface DestinationItem {
  from: string;
  to: string;
  distance: number;
  discount?: number;
  price?: number;
}
interface LocationItem {
  id: string;
  name: string;
  lat: string;
  lon: string;
}
interface BookingAdmin {
  id: string;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  passengers: number;
  notes: string | null;
  pickup: string;
  destination: string;
  vehicle: string;
  basePrice: number;
  totalPrice: number;
  extras: { label: string; price: number }[];
  date: string | null;
  time: string | null;
  bookingType: string | null;
  hours: number | null;
  status: string;
  token: string;
  driverToken: string | null;
  driverOnline: boolean;
  clientOnline: boolean;
}
type Tab = "bookings" | "pricing" | "fleet" | "services" | "destinations" | "locations";

// ── Shared styles ─────────────────────────────────────────────────────────────
const INP =
  "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#d4af37]/50 transition-colors";
const GOLD =
  "px-4 py-2 rounded-xl bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#c9a227] transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
const GHOST =
  "px-4 py-2 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors";
const RED =
  "px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-colors";
const LBL =
  "block text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5";
const CARD = "bg-white/[0.03] border border-white/10 rounded-2xl p-5";

// ── Pricing Tab ───────────────────────────────────────────────────────────────
function PricingTab({
  data,
  onSave,
}: {
  data: Pricing;
  onSave: (d: Pricing) => Promise<void>;
}) {
  const [form, setForm] = useState(data);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof Pricing, v: string) =>
    setForm((f) => ({ ...f, [k]: parseFloat(v) || 0 }));

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div className={CARD}>
        <p className="text-xs font-semibold text-[#d4af37] uppercase tracking-widest mb-5">
          Base &amp; Per-Km Rates
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(
            [
              { k: "base", label: "Base fee (€)" },
              { k: "economy", label: "Economy / km" },
              { k: "business", label: "Business / km" },
              { k: "luxury", label: "Luxury / km" },
            ] as { k: keyof Pricing; label: string }[]
          ).map(({ k, label }) => (
            <div key={k}>
              <label className={LBL}>{label}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form[k]}
                onChange={(e) => set(k, e.target.value)}
                className={INP}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={CARD}>
        <p className="text-xs font-semibold text-[#d4af37] uppercase tracking-widest mb-5">
          Per-Hour Rates
        </p>
        <div className="grid grid-cols-3 gap-4">
          {(
            [
              { k: "economyPerHour", label: "Economy / hr" },
              { k: "businessPerHour", label: "Business / hr" },
              { k: "luxuryPerHour", label: "Luxury / hr" },
            ] as { k: keyof Pricing; label: string }[]
          ).map(({ k, label }) => (
            <div key={k}>
              <label className={LBL}>{label}</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={form[k]}
                onChange={(e) => set(k, e.target.value)}
                className={INP}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        className={GOLD}
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          await onSave(form);
          setSaving(false);
        }}
      >
        {saving ? "Saving…" : "Save Pricing"}
      </button>
    </div>
  );
}

// ── Fleet Tab ─────────────────────────────────────────────────────────────────
const FLEET_EMPTY = {
  name: "",
  category: "",
  description: "",
  image: "",
  priceLabel: "",
  passengers: "",
  luggage: "",
  features: "",
};
type FleetForm = typeof FLEET_EMPTY;

function FleetFields({
  form,
  onChange,
}: {
  form: FleetForm;
  onChange: (f: FleetForm) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (json.url) onChange({ ...form, image: json.url });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className={LBL}>Name</label>
        <input
          value={form.name}
          placeholder="Mercedes S-Class"
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          className={INP}
        />
      </div>
      <div>
        <label className={LBL}>Category</label>
        <input
          value={form.category}
          placeholder="Business"
          onChange={(e) => onChange({ ...form, category: e.target.value })}
          className={INP}
        />
      </div>
      <div>
        <label className={LBL}>Price Label</label>
        <input
          value={form.priceLabel}
          placeholder="from 1.20/km"
          onChange={(e) => onChange({ ...form, priceLabel: e.target.value })}
          className={INP}
        />
      </div>
      <div>
        <label className={LBL}>Passengers</label>
        <input
          value={form.passengers}
          placeholder="Up to 3"
          onChange={(e) => onChange({ ...form, passengers: e.target.value })}
          className={INP}
        />
      </div>
      <div>
        <label className={LBL}>Luggage</label>
        <input
          value={form.luggage}
          placeholder="2 suitcases"
          onChange={(e) => onChange({ ...form, luggage: e.target.value })}
          className={INP}
        />
      </div>
      <div className="col-span-2">
        <label className={LBL}>Image URL</label>
        <div className="flex gap-2">
          <input
            value={form.image}
            placeholder="https://… or upload below"
            onChange={(e) => onChange({ ...form, image: e.target.value })}
            className={INP}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            type="button"
            className={GHOST + " shrink-0"}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "…" : "Upload"}
          </button>
        </div>
        {form.image && (
          <div className="mt-2 h-20 w-full relative rounded-lg overflow-hidden">
            <Image
              src={form.image}
              alt=""
              fill
              sizes="400px"
              className="object-cover"
            />
          </div>
        )}
      </div>
      <div className="col-span-2">
        <label className={LBL}>Description</label>
        <textarea
          value={form.description}
          rows={2}
          placeholder="Description…"
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          className={INP + " resize-none"}
        />
      </div>
      <div className="col-span-2">
        <label className={LBL}>Features (comma-separated)</label>
        <input
          value={form.features}
          placeholder="Wi-Fi, Leather seats, Climate control"
          onChange={(e) => onChange({ ...form, features: e.target.value })}
          className={INP}
        />
      </div>
    </div>
  );
}

function FleetTab({
  data,
  onSave,
}: {
  data: FleetItem[];
  onSave: (d: FleetItem[]) => Promise<void>;
}) {
  const [items, setItems] = useState(data);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FleetForm>(FLEET_EMPTY);
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<FleetForm>(FLEET_EMPTY);

  const persist = (updated: FleetItem[]) => {
    setItems(updated);
    return onSave(updated);
  };

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {items.map((item) => (
        <div key={item.id} className={CARD}>
          {editId === item.id ? (
            <div className="flex flex-col gap-3">
              <FleetFields form={editForm} onChange={setEditForm} />
              <div className="flex gap-2">
                <button
                  className={GOLD}
                  onClick={() => {
                    persist(
                      items.map((i) =>
                        i.id === editId
                          ? {
                              ...i,
                              ...editForm,
                              features: editForm.features
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            }
                          : i,
                      ),
                    );
                    setEditId(null);
                  }}
                >
                  Save
                </button>
                <button className={GHOST} onClick={() => setEditId(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              {item.image && (
                <div className="w-20 h-14 relative rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm">{item.name}</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#d4af37]/70 bg-[#d4af37]/10 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </div>
                <p className="text-white/40 text-xs line-clamp-1">
                  {item.description}
                </p>
                <p className="text-[#d4af37]/60 text-xs mt-0.5">
                  {item.priceLabel}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  className={GHOST}
                  onClick={() => {
                    setEditId(item.id);
                    setEditForm({
                      name: item.name,
                      category: item.category,
                      description: item.description,
                      image: item.image,
                      priceLabel: item.priceLabel,
                      passengers: item.passengers ?? "",
                      luggage: item.luggage ?? "",
                      features: item.features?.join(", ") ?? "",
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  className={RED}
                  onClick={() => persist(items.filter((i) => i.id !== item.id))}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <div className={CARD}>
          <p className="text-xs font-semibold text-[#d4af37] uppercase tracking-widest mb-3">
            New Vehicle
          </p>
          <FleetFields form={newForm} onChange={setNewForm} />
          <div className="flex gap-2 mt-3">
            <button
              className={GOLD}
              onClick={() => {
                persist([
                  ...items,
                  {
                    id: Date.now().toString(),
                    ...newForm,
                    features: newForm.features
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                ]);
                setNewForm(FLEET_EMPTY);
                setAdding(false);
              }}
            >
              Add Vehicle
            </button>
            <button
              className={GHOST}
              onClick={() => {
                setAdding(false);
                setNewForm(FLEET_EMPTY);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className={GHOST + " w-full"} onClick={() => setAdding(true)}>
          + Add Vehicle
        </button>
      )}
    </div>
  );
}

// ── Services Tab ──────────────────────────────────────────────────────────────
const SVC_EMPTY = {
  title: "",
  tag: "",
  description: "",
  highlights: "",
  image: "",
};
type SvcForm = typeof SVC_EMPTY;

function SvcImageUpload({
  image,
  onChange,
}: {
  image: string;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "services");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (json.url) onChange(json.url);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="col-span-2">
      <label className={LBL}>Image (optional)</label>
      <div className="flex gap-2">
        <input
          value={image}
          placeholder="https://… or upload"
          onChange={(e) => onChange(e.target.value)}
          className={INP}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <button
          type="button"
          className={GHOST + " shrink-0"}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "…" : "📷"}
        </button>
      </div>
      {image && (
        <div className="mt-2 h-20 w-full relative rounded-lg overflow-hidden">
          <Image
            src={image}
            alt=""
            fill
            sizes="400px"
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}

function ServicesTab({
  data,
  onSave,
}: {
  data: ServiceItem[];
  onSave: (d: ServiceItem[]) => Promise<void>;
}) {
  const [items, setItems] = useState(data);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SvcForm>(SVC_EMPTY);
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<SvcForm>(SVC_EMPTY);

  const persist = (updated: ServiceItem[]) => {
    setItems(updated);
    return onSave(updated);
  };

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {items.map((item, idx) => (
        <div key={item.id} className={CARD}>
          {editId === item.id ? (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                {(["title", "tag"] as const).map((k) => (
                  <div key={k}>
                    <label className={LBL}>
                      {k === "title" ? "Title" : "Tag"}
                    </label>
                    <input
                      value={editForm[k]}
                      placeholder={
                        k === "title" ? "Airport Transfer" : "Most popular"
                      }
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, [k]: e.target.value }))
                      }
                      className={INP}
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className={LBL}>Description</label>
                  <textarea
                    value={editForm.description}
                    rows={3}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    className={INP + " resize-none"}
                  />
                </div>
                <div className="col-span-2">
                  <label className={LBL}>Highlights (comma-separated)</label>
                  <input
                    value={editForm.highlights}
                    placeholder="Feature 1, Feature 2, Feature 3"
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, highlights: e.target.value }))
                    }
                    className={INP}
                  />
                </div>
                <SvcImageUpload
                  image={editForm.image}
                  onChange={(url) => setEditForm((f) => ({ ...f, image: url }))}
                />
              </div>
              <div className="flex gap-2">
                <button
                  className={GOLD}
                  onClick={() => {
                    persist(
                      items.map((i) =>
                        i.id === editId
                          ? {
                              ...i,
                              ...editForm,
                              highlights: editForm.highlights
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                              image: editForm.image || undefined,
                            }
                          : i,
                      ),
                    );
                    setEditId(null);
                  }}
                >
                  Save
                </button>
                <button className={GHOST} onClick={() => setEditId(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              {item.image ? (
                <div className="w-10 h-10 relative rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <span className="text-3xl font-bold text-white/10 w-10 shrink-0 tabular-nums">
                  {item.number || String(idx + 1).padStart(2, "0")}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{item.title}</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#d4af37]/70 bg-[#d4af37]/10 px-2 py-0.5 rounded-full">
                    {item.tag}
                  </span>
                </div>
                <p className="text-white/40 text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  className={GHOST}
                  onClick={() => {
                    setEditId(item.id);
                    setEditForm({
                      title: item.title,
                      tag: item.tag,
                      description: item.description,
                      highlights: item.highlights?.join(", ") ?? "",
                      image: item.image ?? "",
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  className={RED}
                  onClick={() => persist(items.filter((i) => i.id !== item.id))}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <div className={CARD}>
          <p className="text-xs font-semibold text-[#d4af37] uppercase tracking-widest mb-3">
            New Service
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(["title", "tag"] as const).map((k) => (
              <div key={k}>
                <label className={LBL}>{k === "title" ? "Title" : "Tag"}</label>
                <input
                  value={newForm[k]}
                  placeholder={k === "title" ? "VIP Service" : "Premium"}
                  onChange={(e) =>
                    setNewForm((f) => ({ ...f, [k]: e.target.value }))
                  }
                  className={INP}
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className={LBL}>Description</label>
              <textarea
                value={newForm.description}
                rows={3}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, description: e.target.value }))
                }
                className={INP + " resize-none"}
              />
            </div>
            <div className="col-span-2">
              <label className={LBL}>Highlights (comma-separated)</label>
              <input
                value={newForm.highlights}
                placeholder="Feature 1, Feature 2, Feature 3"
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, highlights: e.target.value }))
                }
                className={INP}
              />
            </div>
            <SvcImageUpload
              image={newForm.image}
              onChange={(url) => setNewForm((f) => ({ ...f, image: url }))}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              className={GOLD}
              onClick={() => {
                const num = String(items.length + 1).padStart(2, "0");
                persist([
                  ...items,
                  {
                    id: Date.now().toString(),
                    number: num,
                    ...newForm,
                    highlights: newForm.highlights
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                    image: newForm.image || undefined,
                  },
                ]);
                setNewForm(SVC_EMPTY);
                setAdding(false);
              }}
            >
              Add Service
            </button>
            <button
              className={GHOST}
              onClick={() => {
                setAdding(false);
                setNewForm(SVC_EMPTY);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className={GHOST + " w-full"} onClick={() => setAdding(true)}>
          + Add Service
        </button>
      )}
    </div>
  );
}

// ── Destinations Tab ──────────────────────────────────────────────────────────
type DestForm = {
  from: string;
  to: string;
  distance: number;
  discount: number | "";
  price: number | "";
};
const DEST_EMPTY: DestForm = {
  from: "",
  to: "",
  distance: 0,
  discount: "",
  price: "",
};

function toDestItem(f: DestForm): DestinationItem {
  const item: DestinationItem = {
    from: f.from,
    to: f.to,
    distance: f.distance,
  };
  if (f.discount !== "" && f.discount > 0) item.discount = f.discount;
  if (f.price !== "" && f.price > 0) item.price = f.price;
  return item;
}

// ── Nominatim autocomplete input ──────────────────────────────────────────────

async function searchNominatim(query: string) {
  if (!query || query.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      { headers: { "Accept-Language": "en" } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((r: { display_name: string }) => r.display_name as string);
  } catch {
    return [];
  }
}

function NominatimField({
  label,
  value,
  placeholder,
  onSelect,
}: {
  label: string;
  value: string;
  placeholder: string;
  onSelect: (name: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep internal query in sync with external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleChange = (v: string) => {
    setQuery(v);
    onSelect(v); // always reflect typed text back to parent
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const results = await searchNominatim(v);
      setSuggestions(results);
      setOpen(results.length > 0);
    }, 350);
  };

  return (
    <div className="relative">
      <label className={LBL}>{label}</label>
      <input
        value={query}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className={INP}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              onMouseDown={(e) => e.preventDefault()} // prevent onBlur
              onClick={() => {
                setQuery(s);
                onSelect(s);
                setOpen(false);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DestFields({
  form,
  onChange,
}: {
  form: DestForm;
  onChange: (f: DestForm) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(["from", "to"] as const).map((k) => (
        <NominatimField
          key={k}
          label={k === "from" ? "From" : "To"}
          value={form[k]}
          placeholder={k === "from" ? "Dublin Airport" : "Cork"}
          onSelect={(name) => onChange({ ...form, [k]: name })}
        />
      ))}
      <div>
        <label className={LBL}>Distance (km)</label>
        <input
          type="number"
          min="0"
          value={form.distance || ""}
          placeholder="0"
          onChange={(e) =>
            onChange({ ...form, distance: parseInt(e.target.value) || 0 })
          }
          className={INP}
        />
      </div>
      <div>
        <label className={LBL}>Discount % (optional)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={form.discount}
          placeholder="—"
          onChange={(e) =>
            onChange({
              ...form,
              discount: e.target.value === "" ? "" : parseInt(e.target.value),
            })
          }
          className={INP}
        />
      </div>
      <div>
        <label className={LBL}>Fixed Price € (optional)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          placeholder="auto-calculated"
          onChange={(e) =>
            onChange({
              ...form,
              price: e.target.value === "" ? "" : parseFloat(e.target.value),
            })
          }
          className={INP}
        />
      </div>
    </div>
  );
}

function DestinationsTab({
  data,
  onSave,
}: {
  data: DestinationItem[];
  onSave: (d: DestinationItem[]) => Promise<void>;
}) {
  const [items, setItems] = useState(data);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<DestForm>(DEST_EMPTY);
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<DestForm>(DEST_EMPTY);

  const persist = (updated: DestinationItem[]) => {
    setItems(updated);
    return onSave(updated);
  };

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {items.map((item, idx) => (
        <div key={idx} className={CARD}>
          {editIdx === idx ? (
            <div className="flex flex-col gap-3">
              <DestFields form={editForm} onChange={setEditForm} />
              <div className="flex gap-2">
                <button
                  className={GOLD}
                  onClick={() => {
                    const updated = [...items];
                    updated[idx] = toDestItem(editForm);
                    persist(updated);
                    setEditIdx(null);
                  }}
                >
                  Save
                </button>
                <button className={GHOST} onClick={() => setEditIdx(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold mb-0.5">
                  <span>{item.from}</span>
                  <svg
                    className="w-4 h-4 text-[#d4af37]/50 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                    />
                  </svg>
                  <span>{item.to}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-white/40 text-xs">
                    {item.distance} km
                  </span>
                  {item.discount && (
                    <span className="text-[10px] font-bold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full">
                      -{item.discount}% OFF
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  className={GHOST}
                  onClick={() => {
                    setEditIdx(idx);
                    setEditForm({
                      from: item.from,
                      to: item.to,
                      distance: item.distance,
                      discount: item.discount ?? "",
                      price: item.price ?? "",
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  className={RED}
                  onClick={() => persist(items.filter((_, i) => i !== idx))}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <div className={CARD}>
          <p className="text-xs font-semibold text-[#d4af37] uppercase tracking-widest mb-3">
            New Route
          </p>
          <DestFields form={newForm} onChange={setNewForm} />
          <div className="flex gap-2 mt-3">
            <button
              className={GOLD}
              onClick={() => {
                persist([...items, toDestItem(newForm)]);
                setNewForm(DEST_EMPTY);
                setAdding(false);
              }}
            >
              Add Route
            </button>
            <button
              className={GHOST}
              onClick={() => {
                setAdding(false);
                setNewForm(DEST_EMPTY);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className={GHOST + " w-full"} onClick={() => setAdding(true)}>
          + Add Route
        </button>
      )}
    </div>
  );
}

// ── Locations Tab ─────────────────────────────────────────────────────────────
type LocForm = { name: string; lat: string; lon: string };
const LOC_EMPTY: LocForm = { name: "", lat: "", lon: "" };

function LocationsTab({
  data,
  onSave,
}: {
  data: LocationItem[];
  onSave: (d: LocationItem[]) => Promise<void>;
}) {
  const [items, setItems] = useState(data);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<LocForm>(LOC_EMPTY);
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<LocForm>(LOC_EMPTY);

  const persist = (updated: LocationItem[]) => {
    setItems(updated);
    return onSave(updated);
  };

  const toItem = (f: LocForm): LocationItem => ({
    id: crypto.randomUUID(),
    name: f.name,
    lat: f.lat,
    lon: f.lon,
  });

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <p className="text-xs text-white/30 mb-1">
        These locations appear as quick-select chips on the booking calculator.
        Add airports, cities, or popular pickup/dropoff points.
      </p>
      {items.map((item, idx) => (
        <div key={item.id} className={CARD}>
          {editIdx === idx ? (
            <div className="flex flex-col gap-3">
              <LocFields form={editForm} onChange={setEditForm} />
              <div className="flex gap-2">
                <button
                  className={GOLD}
                  onClick={() => {
                    const updated = [...items];
                    updated[idx] = { ...item, ...editForm };
                    persist(updated);
                    setEditIdx(null);
                  }}
                >
                  Save
                </button>
                <button className={GHOST} onClick={() => setEditIdx(null)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-white/30 mt-0.5">
                  {item.lat}, {item.lon}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  className={GHOST}
                  onClick={() => {
                    setEditIdx(idx);
                    setEditForm({
                      name: item.name,
                      lat: item.lat,
                      lon: item.lon,
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  className={RED}
                  onClick={() => persist(items.filter((_, i) => i !== idx))}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <div className={CARD}>
          <p className="text-xs font-semibold text-[#d4af37] uppercase tracking-widest mb-3">
            New Location
          </p>
          <LocFields form={newForm} onChange={setNewForm} />
          <div className="flex gap-2 mt-3">
            <button
              className={GOLD}
              disabled={!newForm.name || !newForm.lat || !newForm.lon}
              onClick={() => {
                persist([...items, toItem(newForm)]);
                setNewForm(LOC_EMPTY);
                setAdding(false);
              }}
            >
              Add Location
            </button>
            <button
              className={GHOST}
              onClick={() => {
                setAdding(false);
                setNewForm(LOC_EMPTY);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className={GHOST + " w-full"} onClick={() => setAdding(true)}>
          + Add Location
        </button>
      )}
    </div>
  );
}

function LocFields({
  form,
  onChange,
}: {
  form: LocForm;
  onChange: (f: LocForm) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="sm:col-span-3">
        <label className={LBL}>Name</label>
        <input
          value={form.name}
          placeholder="Dublin Airport"
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          className={INP}
        />
      </div>
      <div>
        <label className={LBL}>Latitude</label>
        <input
          value={form.lat}
          placeholder="53.4264"
          onChange={(e) => onChange({ ...form, lat: e.target.value })}
          className={INP}
        />
      </div>
      <div>
        <label className={LBL}>Longitude</label>
        <input
          value={form.lon}
          placeholder="-6.2499"
          onChange={(e) => onChange({ ...form, lon: e.target.value })}
          className={INP}
        />
      </div>
    </div>
  );
}

// ── Bookings Tab ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  OFFER_SENT: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  CONFIRMED: "bg-green-400/10 text-green-400 border-green-400/20",
  REJECTED: "bg-red-400/10 text-red-400 border-red-400/20",
  CANCELLED: "bg-white/5 text-white/30 border-white/10",
  COMPLETED: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
};

const VEHICLE_MAP: Record<string, string> = {
  economy: "Economy",
  business: "Business",
  luxury: "Luxury",
};

function BookingsTab({
  data,
  onRefresh,
}: {
  data: BookingAdmin[];
  onRefresh: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<string>("ALL");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = filter === "ALL" ? data : data.filter((b) => b.status === filter);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      await onRefresh();
    } catch { /* ignore */ }
    setUpdating(null);
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {["ALL", "PENDING", "OFFER_SENT", "CONFIRMED", "COMPLETED", "REJECTED", "CANCELLED"].map(
          (s) => {
            const count = s === "ALL" ? data.length : data.filter((b) => b.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  filter === s
                    ? "bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/30"
                    : "bg-white/[0.03] text-white/40 border-white/10 hover:text-white"
                }`}
              >
                {s === "ALL" ? "All" : s.replace("_", " ")} ({count})
              </button>
            );
          },
        )}
      </div>

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-white/20 text-sm">
          No bookings found
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((b) => (
            <div key={b.id} className={CARD + " !p-0 overflow-hidden"}>
              {/* Header row */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${STATUS_BADGE[b.status] ?? "text-white/40"}`}
                  >
                    {b.status.replace("_", " ")}
                  </span>
                  <span className="text-xs text-white/20">
                    #{b.id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-xs text-white/20">
                    {new Date(b.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <span className="text-sm font-bold text-[#d4af37]">
                  €{b.totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Body */}
              <div className="px-5 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {/* Client */}
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">Client</span>
                  <p className="text-white/80 font-medium">{b.clientName}</p>
                  <p className="text-white/40 text-xs">{b.clientEmail}</p>
                  <p className="text-white/40 text-xs">{b.clientPhone}</p>
                </div>

                {/* Route */}
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">Route</span>
                  <p className="text-white/80 text-xs mt-0.5">
                    <span className="text-green-400/70">●</span> {b.pickup}
                  </p>
                  <p className="text-white/80 text-xs">
                    <span className="text-[#d4af37]/70">●</span> {b.destination}
                  </p>
                </div>

                {/* Details */}
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">Details</span>
                  <p className="text-white/60 text-xs mt-0.5">
                    {VEHICLE_MAP[b.vehicle] ?? b.vehicle} · {b.passengers} pax
                    {b.bookingType === "hourly" && b.hours ? ` · ${b.hours}h hourly` : ""}
                  </p>
                  {b.date && (
                    <p className="text-white/60 text-xs">
                      {b.date}{b.time ? ` · ${b.time}` : ""}
                    </p>
                  )}
                  {b.notes && (
                    <p className="text-white/40 text-xs italic mt-0.5 truncate max-w-[250px]">
                      {b.notes}
                    </p>
                  )}
                </div>

                {/* Pricing */}
                <div>
                  <span className="text-white/30 text-xs uppercase tracking-wider">Pricing</span>
                  <p className="text-white/60 text-xs mt-0.5">
                    Base: €{b.basePrice.toFixed(2)}
                  </p>
                  {b.extras?.length > 0 && (
                    <p className="text-white/40 text-xs">
                      Extras: {b.extras.map((e) => `${e.label} €${e.price.toFixed(2)}`).join(", ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer — links + actions */}
              <div className="px-5 py-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                {/* Track link */}
                <a
                  href={`${baseUrl}/track/${b.token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#d4af37]/60 hover:text-[#d4af37] transition-colors"
                >
                  Track page ↗
                </a>

                {/* Driver link */}
                {b.driverToken && (
                  <a
                    href={`${baseUrl}/driver/${b.driverToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400/60 hover:text-blue-400 transition-colors"
                  >
                    Driver panel ↗
                  </a>
                )}

                {/* Live indicators */}
                {b.driverOnline && (
                  <span className="text-[10px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Driver live
                  </span>
                )}
                {b.clientOnline && (
                  <span className="text-[10px] text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Client live
                  </span>
                )}

                <div className="flex-1" />

                {/* Status actions */}
                {b.status !== "CANCELLED" && b.status !== "REJECTED" && b.status !== "COMPLETED" && (
                  <button
                    onClick={() => updateStatus(b.id, "CANCELLED")}
                    disabled={updating === b.id}
                    className="text-xs text-red-400/50 hover:text-red-400 transition-colors disabled:opacity-30"
                  >
                    Cancel
                  </button>
                )}
                {b.status === "CONFIRMED" && (
                  <button
                    onClick={() => updateStatus(b.id, "COMPLETED")}
                    disabled={updating === b.id}
                    className="text-xs px-3 py-1 rounded-lg bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/20 transition-colors disabled:opacity-30"
                  >
                    Complete
                  </button>
                )}
                {b.status === "PENDING" && (
                  <button
                    onClick={() => updateStatus(b.id, "CONFIRMED")}
                    disabled={updating === b.id}
                    className="text-xs px-3 py-1 rounded-lg bg-green-400/10 text-green-400 border border-green-400/20 hover:bg-green-400/20 transition-colors disabled:opacity-30"
                  >
                    Confirm
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main AdminPage ────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<Tab>("bookings");
  const [bookings, setBookings] = useState<BookingAdmin[] | null>(null);
  const [pricing, setPricingState] = useState<Pricing | null>(null);
  const [fleet, setFleetState] = useState<FleetItem[] | null>(null);
  const [services, setServicesState] = useState<ServiceItem[] | null>(null);
  const [destinations, setDestinationsState] = useState<
    DestinationItem[] | null
  >(null);
  const [locations, setLocationsState] = useState<LocationItem[] | null>(null);
  const [toast, setToast] = useState("");

  const callApi = useCallback(
    async (method: string, entity: string, body?: unknown) => {
      const res = await fetch(`/api/admin/data?entity=${entity}`, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      if (res.status === 401) {
        setAuthed(false);
        throw new Error("Session expired");
      }
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    [],
  );

  const loadAll = useCallback(async () => {
    const [p, f, s, d, l] = await Promise.all([
      callApi("GET", "pricing"),
      callApi("GET", "fleet"),
      callApi("GET", "services"),
      callApi("GET", "destinations"),
      callApi("GET", "locations").catch(() => []),
    ]);
    setPricingState(p);
    setFleetState(f);
    setServicesState(s);
    setDestinationsState(d);
    setLocationsState(l);
    // Bookings use a separate endpoint
    fetch("/api/admin/bookings", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((b: BookingAdmin[]) => setBookings(b))
      .catch(() => setBookings([]));
  }, [callApi]);

  useEffect(() => {
    fetch("/api/admin/auth", { credentials: "include" })
      .then((r) => r.json())
      .then(({ ok }) => setAuthed(!!ok))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (authed) loadAll();
  }, [authed, loadAll]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const makeSaver =
    <T,>(
      entity: string,
      setState: React.Dispatch<React.SetStateAction<T | null>>,
    ) =>
    async (data: T) => {
      await callApi("PUT", entity, data);
      setState(data);
      showToast("Saved!");
    };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      setAuthed(true);
    } else setAuthError("Incorrect email or password");
  };

  // ── Checking saved session
  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37] animate-spin" />
      </div>
    );
  }

  // ── Login screen
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="text-2xl font-bold">
              <span className="text-[#d4af37]">Lux</span>Ride
            </p>
            <p className="text-white/30 text-sm mt-1">Admin Panel</p>
          </div>
          <form
            onSubmit={handleLogin}
            className={CARD + " flex flex-col gap-4"}
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              autoFocus
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              className={INP + " py-3 text-base"}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              className={INP + " py-3 text-base"}
            />
            {authError && (
              <p className="text-red-400 text-xs text-center">{authError}</p>
            )}
            <button type="submit" className={GOLD + " w-full py-3 text-base"}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard
  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "bookings",
      label: "Bookings",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
          <path d="M15 3v4a1 1 0 0 0 1 1h4" />
        </svg>
      ),
    },
    {
      key: "pricing",
      label: "Pricing",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      key: "fleet",
      label: "Fleet",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 17H5a2 2 0 0 1-2-2v-1l2.68-6.26A2 2 0 0 1 7.52 6h8.96a2 2 0 0 1 1.84 1.74L21 14v1a2 2 0 0 1-2 2Z" />
          <circle cx="7.5" cy="17" r="2" />
          <circle cx="16.5" cy="17" r="2" />
        </svg>
      ),
    },
    {
      key: "services",
      label: "Services",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      key: "destinations",
      label: "Destinations",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      key: "locations",
      label: "Locations",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
      ),
    },
  ];

  const handleSignOut = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });
    setAuthed(false);
    setPricingState(null);
    setFleetState(null);
    setServicesState(null);
    setDestinationsState(null);
    setLocationsState(null);
    setBookings(null);
  };

  const isLoading =
    (tab === "bookings" && !bookings) ||
    (tab === "pricing" && !pricing) ||
    (tab === "fleet" && !fleet) ||
    (tab === "services" && !services) ||
    (tab === "destinations" && !destinations) ||
    (tab === "locations" && !locations);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#d4af37] text-black text-sm font-semibold px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast}
        </div>
      )}

      {/* Header + Tabs */}
      <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-sm">
            <span className="text-[#d4af37]">Lux</span>Ride{" "}
            <span className="text-white/30 font-normal">/ admin</span>
          </span>
          <button
            onClick={handleSignOut}
            className="text-xs text-white/30 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-6 flex overflow-x-auto scrollbar-hide">
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                tab === key
                  ? "border-[#d4af37] text-[#d4af37]"
                  : "border-transparent text-white/40 hover:text-white"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 rounded-full border-2 border-[#d4af37]/30 border-t-[#d4af37] animate-spin" />
          </div>
        ) : (
          <>
            {tab === "bookings" && bookings && (
              <BookingsTab
                data={bookings}
                onRefresh={async () => {
                  const r = await fetch("/api/admin/bookings", { credentials: "include" });
                  if (r.ok) setBookings(await r.json());
                }}
              />
            )}
            {tab === "pricing" && pricing && (
              <PricingTab
                data={pricing}
                onSave={makeSaver("pricing", setPricingState)}
              />
            )}
            {tab === "fleet" && fleet && (
              <FleetTab
                data={fleet}
                onSave={makeSaver("fleet", setFleetState)}
              />
            )}
            {tab === "services" && services && (
              <ServicesTab
                data={services}
                onSave={makeSaver("services", setServicesState)}
              />
            )}
            {tab === "destinations" && destinations && (
              <DestinationsTab
                data={destinations}
                onSave={makeSaver("destinations", setDestinationsState)}
              />
            )}
            {tab === "locations" && locations && (
              <LocationsTab
                data={locations}
                onSave={makeSaver("locations", setLocationsState)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
