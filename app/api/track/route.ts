import { NextResponse } from "next/server";
import { getBookingByToken } from "@/lib/services/booking.service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const booking = await getBookingByToken(token);
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    online: booking.driverOnline,
    lat: booking.driverLat,
    lon: booking.driverLon,
    pickup: booking.pickup,
    destination: booking.destination,
    clientName: booking.clientName,
    status: booking.status,
    bookingId: booking.id,
  });
}
