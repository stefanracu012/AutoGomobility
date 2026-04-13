import { NextResponse } from "next/server";
import {
  updateDriverLocation,
  setDriverOffline,
} from "@/lib/services/booking.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { driverToken, lat, lon, offline } = body;

    if (!driverToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    if (offline) {
      await setDriverOffline(driverToken);
    } else {
      if (typeof lat !== "number" || typeof lon !== "number") {
        return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
      }
      await updateDriverLocation(driverToken, lat, lon);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Driver location update error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
