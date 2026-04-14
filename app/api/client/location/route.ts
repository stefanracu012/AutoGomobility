import { NextResponse } from "next/server";
import {
  updateClientLocation,
  setClientOffline,
} from "@/lib/services/booking.service";

export async function POST(req: Request) {
  const { token, lat, lon, offline } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  if (offline) {
    await setClientOffline(token);
    return NextResponse.json({ ok: true });
  }

  if (lat == null || lon == null) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  await updateClientLocation(token, lat, lon);
  return NextResponse.json({ ok: true });
}
