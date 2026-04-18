import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

/** Read from MongoDB first, fall back to bundled JSON (dev / first deploy) */
async function readSetting<T>(key: string): Promise<T> {
  try {
    const doc = await prisma.siteSettings.findUnique({ where: { key } });
    if (doc) return doc.value as unknown as T;
  } catch {
    /* DB unavailable in build — fall through to JSON */
  }
  return JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, `${key}.json`), "utf-8"),
  ) as T;
}

/** Write to MongoDB (Vercel-safe, persistent) */
async function writeSetting(key: string, value: unknown): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { key },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: { value: value as any },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: { key, value: value as any },
  });
}

// ── Types ────────────────────────────────────────────────────────────────────

import type { Locale } from "@/lib/i18n/types";

/** A field that can be either a plain string (legacy) or per-language object */
export type I18nString = string | Partial<Record<Locale, string>>;

/** Resolve an I18nString to the correct language, falling back to "en" then first available */
export function txt(val: I18nString | undefined, locale: Locale): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[locale] || val.en || Object.values(val).find(Boolean) || "";
}

export interface FleetItem {
  id: string;
  name: I18nString;
  category: I18nString;
  description: I18nString;
  image: string;
  priceLabel: I18nString;
  passengers?: I18nString;
  luggage?: I18nString;
  features?: string[];
}

export interface ServiceItem {
  id: string;
  number: string;
  title: I18nString;
  description: I18nString;
  tag: I18nString;
  highlights?: string[];
  image?: string;
}

export interface DestinationItem {
  from: I18nString;
  to: I18nString;
  distance: number;
  discount?: number;
  price?: number;
}

export interface LocationItem {
  id: string;
  name: string;
  lat: string;
  lon: string;
}

export interface Pricing {
  base: number;
  economy: number;
  business: number;
  luxury: number;
  economyPerHour: number;
  businessPerHour: number;
  luxuryPerHour: number;
}

// ── Readers ───────────────────────────────────────────────────────────────────

export const getFleet = (): Promise<FleetItem[]> => readSetting("fleet");
export const getServices = (): Promise<ServiceItem[]> => readSetting("services");
export const getDestinations = (): Promise<DestinationItem[]> => readSetting("destinations");
export const getPricing = (): Promise<Pricing> => readSetting("pricing");
export const getLocations = async (): Promise<LocationItem[]> => {
  try { return await readSetting("locations"); } catch { return []; }
};

// ── Writers ───────────────────────────────────────────────────────────────────

export const setFleet = (d: FleetItem[]): Promise<void> => writeSetting("fleet", d);
export const setServices = (d: ServiceItem[]): Promise<void> => writeSetting("services", d);
export const setDestinations = (d: DestinationItem[]): Promise<void> => writeSetting("destinations", d);
export const setPricing = (d: Pricing): Promise<void> => writeSetting("pricing", d);
export const setLocations = (d: LocationItem[]): Promise<void> => writeSetting("locations", d);

// ── Site config (hero image, etc.) ────────────────────────────────────────────

export interface SiteConfig {
  heroImage: string;
}

const DEFAULT_HERO = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1920&q=80";

export const getSiteConfig = async (): Promise<SiteConfig> => {
  try { return await readSetting("siteConfig"); } catch { return { heroImage: DEFAULT_HERO }; }
};
export const setSiteConfig = (d: SiteConfig): Promise<void> => writeSetting("siteConfig", d);
