import { NextResponse } from "next/server";
import { createBooking } from "@/lib/services/booking.service";
import { notifyDriver } from "@/lib/telegram/bot";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    const { name, email, phone, pickup } = body;
    const isHourly = body.bookingType === "hourly";
    if (!name || !email || !phone || !pickup) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }
    if (!isHourly && !body.destination) {
      return NextResponse.json(
        { success: false, error: "Missing destination" },
        { status: 400 },
      );
    }

    // Create booking in database
    const booking = await createBooking({
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      passengers: body.passengers ? parseInt(body.passengers, 10) : 1,
      notes: body.notes || undefined,
      pickup,
      destination: body.destination || "Hourly Service",
      vehicle: body.vehicle || "business",
      date: body.date || undefined,
      time: body.time || undefined,
      basePrice: body.price ? parseFloat(body.price) : undefined,
      bookingType: body.bookingType || "transfer",
      hours: body.hours ? parseInt(body.hours, 10) : undefined,
    });

    // Send Telegram notification to driver with inline keyboard
    try {
      await notifyDriver(booking);
    } catch (err) {
      console.error("Failed to notify driver via Telegram:", err);
      // Don't fail the booking if Telegram fails
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
