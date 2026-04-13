export async function register() {
  // Only run in Node.js runtime (not Edge), and only once
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getBot } = await import("@/lib/telegram/bot");

  try {
    const bot = getBot();

    if (process.env.NODE_ENV === "production") {
      // Vercel / production: use webhook mode — no long-polling allowed
      const baseUrl = process.env.BASE_URL;
      if (baseUrl) {
        await bot.telegram.setWebhook(`${baseUrl}/api/telegram/webhook`, {
          drop_pending_updates: true,
        });
        console.log(
          "✅ Telegram webhook set:",
          `${baseUrl}/api/telegram/webhook`,
        );
      } else {
        console.warn("⚠️ BASE_URL not set — Telegram webhook not registered");
      }
    } else {
      // Local dev: remove any existing webhook and use long-polling
      await bot.telegram.deleteWebhook({ drop_pending_updates: true });
      bot.launch({ dropPendingUpdates: true });
      console.log("✅ Telegram bot started in polling mode");
    }
  } catch (err) {
    console.error("❌ Failed to start Telegram bot:", err);
  }
}
