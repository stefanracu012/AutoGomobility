import type { MetadataRoute } from "next";

const BASE = "https://auto-gomobility.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/fleet", "/services", "/booking"];
  const lastModified = new Date();

  return pages.map((p) => ({
    url: `${BASE}${p}`,
    lastModified,
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : p === "/booking" ? 0.9 : 0.8,
  }));
}
