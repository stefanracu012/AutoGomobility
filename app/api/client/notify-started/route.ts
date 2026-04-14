import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyClientLocationStarted } from "@/lib/telegram/bot";

export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { trackToken: token },
      select: { id: true, clientName: true, pickup: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await notifyClientLocationStarted(
      booking.clientName,
      booking.pickup,
      booking.id,
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("notify-started error:", err);
    // Don't fail the client — Telegram notification is best-effort
    return NextResponse.json({ ok: true });
  }
}
