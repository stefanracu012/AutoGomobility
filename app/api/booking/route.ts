export async function POST(req: Request) {
  try {
    const data = await req.json();

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return Response.json(
        { success: false, error: "Telegram not configured" },
        { status: 500 },
      );
    }

    const vehicleLabel =
      data.vehicle === "economy"
        ? "Economy — E-Class"
        : data.vehicle === "business"
          ? "Business — S-Class"
          : "Luxury — V-Class / SUV";

    const message = [
      "🚖 <b>New Booking Request</b>",
      "",
      `👤 <b>Name:</b> ${data.name}`,
      `📧 <b>Email:</b> ${data.email}`,
      `📞 <b>Phone:</b> ${data.phone}`,
      "",
      `📍 <b>Pickup:</b> ${data.pickup}`,
      `🏁 <b>Destination:</b> ${data.destination}`,
      `🚗 <b>Vehicle:</b> ${vehicleLabel}`,
      "",
      `\uD83D\uDC65 <b>Passengers:</b> ${data.passengers || "1"}`,
      `\uD83D\uDCC5 <b>Date:</b> ${data.date || "\u2014"}`,
      `\uD83D\uDD50 <b>Time:</b> ${data.time || "\u2014"}`,
      data.notes ? `\n\uD83D\uDCDD <b>Notes:</b> ${data.notes}` : "",
    ]
      .filter((l) => l !== undefined)
      .join("\n");

    const tgRes = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      },
    );

    if (!tgRes.ok) {
      return Response.json(
        { success: false, error: "Failed to send Telegram message" },
        { status: 500 },
      );
    }

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { success: false, error: "Invalid request" },
      { status: 400 },
    );
  }
}

