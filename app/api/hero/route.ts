import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/data";

export async function GET() {
  const cfg = await getSiteConfig();
  return NextResponse.json({ heroImage: cfg.heroImage });
}
