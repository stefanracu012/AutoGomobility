import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

/**
 * GET  /api/admin/set-webhook  — check current webhook info
 * POST /api/admin/set-webhook  — register webhook with Telegram
 */

async function tgApi(token: string, method: string, body?: object) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
  }

  const info = await tgApi(token, "getWebhookInfo");
  return NextResponse.json(info);
}

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const baseUrl = process.env.BASE_URL;

  if (!token) return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
  if (!baseUrl) return NextResponse.json({ error: "BASE_URL not set" }, { status: 500 });

  const webhookUrl = `${baseUrl}/api/telegram/webhook`;

  const result = await tgApi(token, "setWebhook", {
    url: webhookUrl,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: false,
  });

  return NextResponse.json({ webhookUrl, result });
}
