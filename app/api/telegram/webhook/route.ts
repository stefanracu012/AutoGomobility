import { NextResponse } from "next/server";
import { getBot } from "@/lib/telegram/bot";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const bot = getBot();

    // Process the Telegram webhook update
    await bot.handleUpdate(body);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
