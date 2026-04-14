import { Telegraf, Markup } from "telegraf";
import {
  getBookingById,
  updateVehicle,
  setBasePrice,
  addExtra,
  removeExtra,
  markOfferSent,
  cancelBooking,
  setTelegramMessageId,
} from "@/lib/services/booking.service";
import {
  getSession,
  setSession,
  clearSession,
  updateSession,
} from "@/lib/state/driverSession";
import { sendOfferEmail } from "@/lib/services/email.service";
import type { Booking } from "@prisma/client";

interface Extra {
  label: string;
  price: number;
}

// ── Singleton bot instance ───────────────────────────────────────────

let _bot: Telegraf | null = null;

export function getBot(): Telegraf {
  if (!_bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");
    _bot = new Telegraf(token);
    registerHandlers(_bot);
  }
  return _bot;
}

// ── Format booking text ──────────────────────────────────────────────

function formatBooking(b: Booking): string {
  const extras = b.extras as Extra[];
  const extrasText =
    extras.length > 0
      ? extras.map((e, i) => `  ${i + 1}. ${e.label} — €${e.price.toFixed(2)}`).join("\n")
      : "  None";

  const baseUrl = process.env.BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const driverUrl = `${baseUrl}/driver/${b.driverToken}`;

  return [
    `🚖 <b>Booking #${b.id.slice(-6).toUpperCase()}</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    ``,
    `👤 <b>${b.clientName}</b>`,
    `📧 ${b.clientEmail}`,
    `📞 ${b.clientPhone}`,
    `👥 ${b.passengers} passenger${b.passengers > 1 ? "s" : ""}`,
    ``,
    `📍 <b>From:</b> ${b.pickup}`,
    b.bookingType === "hourly"
      ? `⏱ <b>Hourly:</b> ${b.hours ?? "?"} hour${(b.hours ?? 0) !== 1 ? "s" : ""}`
      : `🏁 <b>To:</b> ${b.destination}`,
    `📅 <b>Date:</b> ${b.date ?? "—"}`,
    `🕐 <b>Time:</b> ${b.time ?? "—"}`,
    ``,
    `🚗 <b>Vehicle:</b> ${b.vehicle}`,
    `💰 <b>Base price:</b> €${b.basePrice.toFixed(2)}`,
    ``,
    `📋 <b>Extras:</b>`,
    extrasText,
    ``,
    `💎 <b>Total: €${b.totalPrice.toFixed(2)}</b>`,
    ``,
    `📌 <b>Status:</b> ${b.status}`,
    b.notes ? `\n📝 <b>Notes:</b> ${b.notes}` : "",
    ``,
    `🔗 <a href="${driverUrl}">Open Driver Panel</a>`,
  ]
    .filter((l) => l !== undefined)
    .join("\n");
}

// ── Main keyboard ────────────────────────────────────────────────────

function mainKeyboard(bookingId: string) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("💰 Set Price", `price:${bookingId}`),
      Markup.button.callback("🚗 Vehicle", `vehicle:${bookingId}`),
    ],
    [
      Markup.button.callback("➕ Add Extra", `extra_add:${bookingId}`),
      Markup.button.callback("➖ Remove Extra", `extra_rm:${bookingId}`),
    ],
    [
      Markup.button.callback("✅ Send Offer", `send:${bookingId}`),
      Markup.button.callback("❌ Reject", `reject:${bookingId}`),
    ],
  ]);
}

// ── Vehicle selection keyboard ───────────────────────────────────────

function vehicleKeyboard(bookingId: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("Economy — E-Class", `vset:${bookingId}:economy`)],
    [
      Markup.button.callback(
        "Business — S-Class",
        `vset:${bookingId}:business`,
      ),
    ],
    [
      Markup.button.callback(
        "Luxury — V-Class / SUV",
        `vset:${bookingId}:luxury`,
      ),
    ],
    [Markup.button.callback("◀️ Back", `back:${bookingId}`)],
  ]);
}

// ── Send new booking notification to driver ──────────────────────────

export async function notifyDriver(booking: Booking) {
  const bot = getBot();
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) throw new Error("TELEGRAM_CHAT_ID is not set");

  const msg = await bot.telegram.sendMessage(
    chatId,
    formatBooking(booking),
    {
      parse_mode: "HTML",
      ...mainKeyboard(booking.id),
    },
  );

  // Save the message ID so we can edit it later
  await setTelegramMessageId(booking.id, msg.message_id);

  return msg;
}

// ── Edit existing message ────────────────────────────────────────────

async function editBookingMessage(
  bot: Telegraf,
  chatId: number,
  messageId: number,
  booking: Booking,
) {
  try {
    await bot.telegram.editMessageText(
      chatId,
      messageId,
      undefined,
      formatBooking(booking),
      {
        parse_mode: "HTML",
        ...mainKeyboard(booking.id),
      },
    );
  } catch {
    // Message might not have changed, ignore "message is not modified" errors
  }
}

// ── Notify driver of client response ─────────────────────────────────

export async function notifyDriverStatus(
  booking: Booking,
  status: "confirmed" | "rejected",
) {
  const bot = getBot();
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) return;

  const emoji = status === "confirmed" ? "✅" : "❌";
  const text = [
    `${emoji} <b>Client ${status === "confirmed" ? "CONFIRMED" : "REJECTED"}</b>`,
    ``,
    `🚖 Booking #${booking.id.slice(-6).toUpperCase()}`,
    `👤 ${booking.clientName}`,
    `📍 ${booking.pickup} → ${booking.destination}`,
    `💎 €${booking.totalPrice.toFixed(2)}`,
  ].join("\n");

  await bot.telegram.sendMessage(chatId, text, { parse_mode: "HTML" });
}

// ── Register all callback & message handlers ─────────────────────────

function registerHandlers(bot: Telegraf) {
  // ── Set Price ────────────────────────────────────────────────────
  bot.action(/^price:(.+)$/, async (ctx) => {
    const bookingId = ctx.match![1];
    const chatId = ctx.callbackQuery.message?.chat.id;
    if (!chatId) return;

    setSession(chatId, {
      bookingId,
      awaitingPrice: true,
      awaitingExtraLabel: false,
      awaitingExtraPrice: false,
    });

    await ctx.answerCbQuery();
    await ctx.reply("💰 Type the base price (number only, e.g. <code>85.50</code>):", {
      parse_mode: "HTML",
    });
  });

  // ── Vehicle selection ────────────────────────────────────────────
  bot.action(/^vehicle:(.+)$/, async (ctx) => {
    const bookingId = ctx.match![1];
    const chatId = ctx.callbackQuery.message?.chat.id;
    const messageId = ctx.callbackQuery.message?.message_id;
    if (!chatId || !messageId) return;

    await ctx.answerCbQuery();
    await bot.telegram.editMessageText(
      chatId,
      messageId,
      undefined,
      "🚗 Select vehicle class:",
      vehicleKeyboard(bookingId),
    );
  });

  // ── Vehicle set ──────────────────────────────────────────────────
  bot.action(/^vset:(.+):(.+)$/, async (ctx) => {
    const bookingId = ctx.match![1];
    const vehicle = ctx.match![2];
    const chatId = ctx.callbackQuery.message?.chat.id;
    const messageId = ctx.callbackQuery.message?.message_id;
    if (!chatId || !messageId) return;

    const booking = await updateVehicle(bookingId, vehicle);
    await ctx.answerCbQuery(`Vehicle set to ${vehicle}`);

    // Refresh the message with booking info
    if (booking.telegramMessageId) {
      await editBookingMessage(bot, chatId, booking.telegramMessageId, booking);
    }

    // Delete the vehicle selection message
    try {
      await bot.telegram.deleteMessage(chatId, messageId);
    } catch { /* ignore */ }
  });

  // ── Add Extra ────────────────────────────────────────────────────
  bot.action(/^extra_add:(.+)$/, async (ctx) => {
    const bookingId = ctx.match![1];
    const chatId = ctx.callbackQuery.message?.chat.id;
    if (!chatId) return;

    setSession(chatId, {
      bookingId,
      awaitingPrice: false,
      awaitingExtraLabel: true,
      awaitingExtraPrice: false,
    });

    await ctx.answerCbQuery();
    await ctx.reply("📋 Type the extra label (e.g. <code>Child seat</code>):", {
      parse_mode: "HTML",
    });
  });

  // ── Remove Extra ─────────────────────────────────────────────────
  bot.action(/^extra_rm:(.+)$/, async (ctx) => {
    const bookingId = ctx.match![1];
    const chatId = ctx.callbackQuery.message?.chat.id;
    if (!chatId) return;

    const booking = await getBookingById(bookingId);
    if (!booking) return ctx.answerCbQuery("Booking not found");

    const extras = booking.extras as Extra[];
    if (extras.length === 0) {
      return ctx.answerCbQuery("No extras to remove");
    }

    const buttons = extras.map((e, i) =>
      [Markup.button.callback(`🗑 ${e.label} (€${e.price.toFixed(2)})`, `exrm:${bookingId}:${i}`)],
    );
    buttons.push([Markup.button.callback("◀️ Back", `back:${bookingId}`)]);

    await ctx.answerCbQuery();
    await ctx.reply("Select extra to remove:", Markup.inlineKeyboard(buttons));
  });

  // ── Confirm extra removal ────────────────────────────────────────
  bot.action(/^exrm:(.+):(\d+)$/, async (ctx) => {
    const bookingId = ctx.match![1];
    const index = parseInt(ctx.match![2], 10);
    const chatId = ctx.callbackQuery.message?.chat.id;
    const messageId = ctx.callbackQuery.message?.message_id;
    if (!chatId) return;

    const booking = await removeExtra(bookingId, index);
    await ctx.answerCbQuery("Extra removed");

    if (booking.telegramMessageId) {
      await editBookingMessage(bot, chatId, booking.telegramMessageId, booking);
    }

    // Delete the removal selection message
    if (messageId) {
      try { await bot.telegram.deleteMessage(chatId, messageId); } catch { /* ignore */ }
    }
  });

  // ── Send Offer ───────────────────────────────────────────────────
  bot.action(/^send:(.+)$/, async (ctx) => {
    const bookingId = ctx.match![1];
    const chatId = ctx.callbackQuery.message?.chat.id;
    if (!chatId) return;

    const booking = await getBookingById(bookingId);
    if (!booking) return ctx.answerCbQuery("Booking not found");

    if (booking.totalPrice <= 0) {
      return ctx.answerCbQuery("⚠️ Set a price first!");
    }

    try {
      await sendOfferEmail(booking);
      const updated = await markOfferSent(bookingId, booking.telegramMessageId ?? undefined);

      if (updated.telegramMessageId) {
        await editBookingMessage(bot, chatId, updated.telegramMessageId, updated);
      }

      await ctx.answerCbQuery("✅ Offer sent to client!");
    } catch (err) {
      console.error("Failed to send offer email:", err);
      await ctx.answerCbQuery("❌ Failed to send email");
    }
  });

  // ── Reject booking ──────────────────────────────────────────────
  bot.action(/^reject:(.+)$/, async (ctx) => {
    const bookingId = ctx.match![1];
    const chatId = ctx.callbackQuery.message?.chat.id;
    if (!chatId) return;

    const booking = await cancelBooking(bookingId);
    await ctx.answerCbQuery("Booking cancelled");

    if (booking.telegramMessageId) {
      await editBookingMessage(bot, chatId, booking.telegramMessageId, booking);
    }
  });

  // ── Back button ──────────────────────────────────────────────────
  bot.action(/^back:(.+)$/, async (ctx) => {
    const bookingId = ctx.match![1];
    const chatId = ctx.callbackQuery.message?.chat.id;
    const messageId = ctx.callbackQuery.message?.message_id;
    if (!chatId || !messageId) return;

    const booking = await getBookingById(bookingId);
    if (!booking) return ctx.answerCbQuery("Booking not found");

    await ctx.answerCbQuery();

    // Delete the intermediate message and refresh the original
    try { await bot.telegram.deleteMessage(chatId, messageId); } catch { /* ignore */ }

    if (booking.telegramMessageId) {
      await editBookingMessage(bot, chatId, booking.telegramMessageId, booking);
    }
  });

  // ── Text messages (for price / extra input flows) ────────────────
  bot.on("text", async (ctx) => {
    const chatId = ctx.message.chat.id;
    const session = getSession(chatId);
    if (!session) return; // Not in any flow, ignore

    const text = ctx.message.text.trim();

    // ── Price input ──────────────────────────────────────────────
    if (session.awaitingPrice) {
      const price = parseFloat(text);
      if (isNaN(price) || price < 0) {
        return ctx.reply("⚠️ Invalid price. Type a number (e.g. <code>85.50</code>):", {
          parse_mode: "HTML",
        });
      }

      const booking = await setBasePrice(session.bookingId, price);
      clearSession(chatId);

      await ctx.reply(`✅ Base price set to €${price.toFixed(2)}`);

      if (booking.telegramMessageId) {
        await editBookingMessage(bot, chatId, booking.telegramMessageId, booking);
      }
      return;
    }

    // ── Extra label input ────────────────────────────────────────
    if (session.awaitingExtraLabel) {
      updateSession(chatId, {
        awaitingExtraLabel: false,
        awaitingExtraPrice: true,
        pendingExtraLabel: text,
      });

      return ctx.reply(
        `💰 Now type the price for "<b>${text}</b>" (number only):`,
        { parse_mode: "HTML" },
      );
    }

    // ── Extra price input ────────────────────────────────────────
    if (session.awaitingExtraPrice && session.pendingExtraLabel) {
      const price = parseFloat(text);
      if (isNaN(price) || price < 0) {
        return ctx.reply("⚠️ Invalid price. Type a number:", {
          parse_mode: "HTML",
        });
      }

      const booking = await addExtra(
        session.bookingId,
        session.pendingExtraLabel,
        price,
      );
      clearSession(chatId);

      await ctx.reply(
        `✅ Added extra: ${session.pendingExtraLabel} — €${price.toFixed(2)}`,
      );

      if (booking.telegramMessageId) {
        await editBookingMessage(bot, chatId, booking.telegramMessageId, booking);
      }
      return;
    }
  });
}
