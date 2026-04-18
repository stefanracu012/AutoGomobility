import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/driver/", "/track/"],
      },
    ],
    sitemap: "https://auto-gomobility.vercel.app/sitemap.xml",
  };
}
