import { NextResponse } from "next/server";
import { getBookingByDriverToken } from "@/lib/services/booking.service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const booking = await getBookingByDriverToken(token);
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: booking.id,
    clientName: booking.clientName,
    clientPhone: booking.clientPhone,
    pickup: booking.pickup,
    destination: booking.destination,
    date: booking.date,
    time: booking.time,
    vehicle: booking.vehicle,
    passengers: booking.passengers,
    notes: booking.notes,
    status: booking.status,
    totalPrice: booking.totalPrice,
    driverOnline: booking.driverOnline,
    bookingType: booking.bookingType ?? "transfer",
    hours: booking.hours ?? null,
  });
}
