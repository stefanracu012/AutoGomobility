import { NextRequest, NextResponse } from "next/server";
import {
  getBookingByToken,
  confirmBooking,
} from "@/lib/services/booking.service";
import { notifyDriverStatus } from "@/lib/telegram/bot";
import { sendStatusEmail } from "@/lib/services/email.service";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new NextResponse(errorPage("Missing token"), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const booking = await getBookingByToken(token);
  if (!booking) {
    return new NextResponse(errorPage("Booking not found"), {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (booking.status !== "OFFER_SENT") {
    return new NextResponse(
      resultPage(
        "info",
        "Deja procesat",
        `Această rezervare a fost deja ${booking.status === "CONFIRMED" ? "confirmată" : booking.status === "REJECTED" ? "refuzată" : "procesată"}.`,
      ),
      { headers: { "Content-Type": "text/html" } },
    );
  }

  try {
    const updated = await confirmBooking(token);

    // Notify driver via Telegram
    try {
      await notifyDriverStatus(updated, "confirmed");
    } catch (err) {
      console.error("Failed to notify driver:", err);
    }

    // Send confirmation email to client
    try {
      await sendStatusEmail(updated, "confirmed");
    } catch (err) {
      console.error("Failed to send confirmation email:", err);
    }

    return new NextResponse(
      resultPage(
        "success",
        "Rezervare confirmată",
        `Mulțumim, ${updated.clientName}! Cursa ta de la <strong>${updated.pickup}</strong> la <strong>${updated.destination}</strong> a fost confirmată. Ne vedem curând!`,
      ),
      { headers: { "Content-Type": "text/html" } },
    );
  } catch (err) {
    console.error("Error confirming booking:", err);
    return new NextResponse(errorPage("Nu am putut confirma rezervarea. Încearcă din nou."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
}

// ── HTML templates ───────────────────────────────────────────────────

type PageType = "success" | "declined" | "info" | "error";

const PHONE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='vertical-align:middle;margin-right:5px'><path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.6 3.42C1.6 2.18 2.57 1 3.81 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.34a16 16 0 0 0 6.29 6.29l1.41-1.34a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z'/></svg>`;
const GLOBE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='vertical-align:middle;margin-right:5px'><circle cx='12' cy='12' r='10'/><line x1='2' y1='12' x2='22' y2='12'/><path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/></svg>`;

const TYPE_STYLES: Record<PageType, { bg: string; color: string; icon: string }> = {
  success:  { bg: "rgba(212,175,55,0.12)",  color: "#d4af37", icon: `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='#d4af37' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'/><polyline points='22 4 12 14.01 9 11.01'/></svg>` },
  declined: { bg: "rgba(156,163,175,0.12)", color: "#9ca3af", icon: `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><line x1='4.93' y1='4.93' x2='19.07' y2='19.07'/></svg>` },
  info:     { bg: "rgba(99,179,237,0.12)",  color: "#63b3ed", icon: `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='#63b3ed' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='12'/><line x1='12' y1='16' x2='12.01' y2='16'/></svg>` },
  error:    { bg: "rgba(239,68,68,0.12)",   color: "#ef4444", icon: `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='#ef4444' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><line x1='15' y1='9' x2='9' y2='15'/><line x1='9' y1='9' x2='15' y2='15'/></svg>` },
};

function resultPage(type: PageType, title: string, message: string): string {
  const s = TYPE_STYLES[type];
  const phone = process.env.CONTACT_PHONE ?? "";
  const site  = process.env.CONTACT_SITE  ?? process.env.BASE_URL ?? "";
  const siteLabel = site.replace(/^https?:\/\//, "");

  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0a0a0a;color:#e5e5e5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:24px}
    .card{max-width:500px;width:100%;background:#111;border:1px solid #1e1e1e;border-radius:24px;overflow:hidden}
    .top{padding:40px 32px 32px;text-align:center}
    .icon{margin-bottom:20px;display:flex;align-items:center;justify-content:center}
    h1{font-size:26px;font-weight:700;margin-bottom:12px;color:${s.color}}
    p{font-size:15px;line-height:1.7;color:#888}
    p strong{color:#ccc}
    .footer{padding:18px 32px;border-top:1px solid #1e1e1e;text-align:center;font-size:13px;color:#555;display:flex;justify-content:center;gap:20px;flex-wrap:wrap}
    .footer a{color:#d4af37;text-decoration:none}
    .footer a:hover{text-decoration:underline}
    .footer span{display:flex;align-items:center}
  </style>
</head>
<body>
  <div class="card">
    <div class="top">
      <div class="icon">${s.icon}</div>
      <h1>${title}</h1>
      <p>${message}</p>
    </div>
    ${phone || site ? `<div class="footer">${phone ? `<span>${PHONE_SVG}<a href="tel:${phone}">${phone}</a></span>` : ""}${site ? `<span>${GLOBE_SVG}<a href="${site}">${siteLabel}</a></span>` : ""}</div>` : ""}
  </div>
</body>
</html>`;
}

function errorPage(message: string): string {
  return resultPage("error", "Eroare", message);
}
