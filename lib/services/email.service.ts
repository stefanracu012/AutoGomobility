import nodemailer from "nodemailer";
import type { Booking } from "@prisma/client";

interface Extra {
  label: string;
  price: number;
}

// ── Transport ────────────────────────────────────────────────────────

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ── Send offer email ─────────────────────────────────────────────────

export async function sendOfferEmail(booking: Booking) {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
  const confirmUrl = `${baseUrl}/api/bookings/confirm?token=${booking.token}`;
  const rejectUrl = `${baseUrl}/api/bookings/reject?token=${booking.token}`;
  const trackUrl = `${baseUrl}/track/${booking.token}`;

  const extras = booking.extras as Extra[];
  const extrasRows = extras.length
    ? extras
        .map(
          (e) =>
            `<tr><td style="padding:8px 16px;border-bottom:1px solid #222">${e.label}</td><td style="padding:8px 16px;border-bottom:1px solid #222;text-align:right">\u20AC${e.price.toFixed(2)}</td></tr>`,
        )
        .join("")
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e5e5e5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#111;border-radius:16px;overflow:hidden;border:1px solid #222">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#d4af37 0%,#b8962e 100%);padding:32px;text-align:center">
      <h1 style="margin:0;color:#000;font-size:24px;font-weight:700">Your Ride Offer</h1>
      <p style="margin:8px 0 0;color:#000;opacity:0.7;font-size:14px">Premium Chauffeur Service</p>
    </div>

    <!-- Content -->
    <div style="padding:32px">
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6">
        Hello <strong>${booking.clientName}</strong>,<br/>
        Here is your personalised offer for the requested transfer:
      </p>

      <!-- Route -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr>
          <td style="padding:12px 16px;background:#1a1a1a;border-radius:8px 8px 0 0">
            <span style="color:#d4af37;font-size:12px;text-transform:uppercase;letter-spacing:1px">Pickup</span><br/>
            <span style="font-size:15px">${booking.pickup}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px;background:#1a1a1a;border-radius:0 0 8px 8px;border-top:1px solid #222">
            <span style="color:#d4af37;font-size:12px;text-transform:uppercase;letter-spacing:1px">Destination</span><br/>
            <span style="font-size:15px">${booking.destination}</span>
          </td>
        </tr>
      </table>

      <!-- Details -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#1a1a1a;border-radius:8px;overflow:hidden">
        <tr>
          <td style="padding:8px 16px;border-bottom:1px solid #222;color:#999;font-size:13px">Vehicle</td>
          <td style="padding:8px 16px;border-bottom:1px solid #222;text-align:right;font-size:14px">${booking.vehicle}</td>
        </tr>
        <tr>
          <td style="padding:8px 16px;border-bottom:1px solid #222;color:#999;font-size:13px">Date</td>
          <td style="padding:8px 16px;border-bottom:1px solid #222;text-align:right;font-size:14px">${booking.date ?? "\u2014"}</td>
        </tr>
        <tr>
          <td style="padding:8px 16px;border-bottom:1px solid #222;color:#999;font-size:13px">Time</td>
          <td style="padding:8px 16px;border-bottom:1px solid #222;text-align:right;font-size:14px">${booking.time ?? "\u2014"}</td>
        </tr>
        <tr>
          <td style="padding:8px 16px;border-bottom:1px solid #222;color:#999;font-size:13px">Passengers</td>
          <td style="padding:8px 16px;border-bottom:1px solid #222;text-align:right;font-size:14px">${booking.passengers}</td>
        </tr>
      </table>

      <!-- Pricing -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#1a1a1a;border-radius:8px;overflow:hidden">
        <tr>
          <td style="padding:8px 16px;border-bottom:1px solid #222;color:#999;font-size:13px">Base price</td>
          <td style="padding:8px 16px;border-bottom:1px solid #222;text-align:right;font-size:14px">\u20AC${booking.basePrice.toFixed(2)}</td>
        </tr>
        ${extrasRows}
        <tr>
          <td style="padding:12px 16px;font-size:16px;font-weight:700;color:#d4af37">Total</td>
          <td style="padding:12px 16px;text-align:right;font-size:20px;font-weight:700;color:#d4af37">\u20AC${booking.totalPrice.toFixed(2)}</td>
        </tr>
      </table>

      ${booking.notes ? `<p style="margin:0 0 24px;padding:12px 16px;background:#1a1a1a;border-radius:8px;font-size:13px;color:#999"><strong style="color:#e5e5e5">Notes:</strong> ${booking.notes}</p>` : ""}

      <!-- CTA Buttons -->
      <div style="text-align:center;margin-top:32px">
        <a href="${confirmUrl}" style="display:inline-block;background:#d4af37;color:#000;font-weight:700;font-size:16px;padding:14px 48px;border-radius:12px;text-decoration:none;margin:0 8px 12px">
          Confirm Booking
        </a>
        <br/>
        <a href="${rejectUrl}" style="display:inline-block;background:transparent;color:#999;font-size:14px;padding:10px 32px;border:1px solid #333;border-radius:12px;text-decoration:none;margin:0 8px 12px">
          Decline Offer
        </a>
        <br/>
        <a href="${trackUrl}" style="display:inline-block;background:transparent;color:#d4af37;font-size:13px;padding:8px 24px;border:1px solid #d4af3740;border-radius:12px;text-decoration:none;margin:0 8px">
          🚖 Track Your Driver Live
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:24px 32px;border-top:1px solid #222;text-align:center">
      <p style="margin:0 0 8px;font-size:12px;color:#666">
        This offer is valid for 24 hours. If you have questions, reply to this email or contact us directly.
      </p>
      <p style="margin:0;font-size:13px">
        📞 <a href="tel:${process.env.CONTACT_PHONE ?? ""}" style="color:#d4af37;text-decoration:none">${process.env.CONTACT_PHONE ?? ""}</a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        🌐 <a href="${process.env.CONTACT_SITE ?? baseUrl}" style="color:#d4af37;text-decoration:none">${(process.env.CONTACT_SITE ?? baseUrl).replace(/^https?:\/\//, "")}</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"Premium Chauffeur" <${process.env.SMTP_USER}>`,
    to: booking.clientEmail,
    subject: `Your Ride Offer \u2014 \u20AC${booking.totalPrice.toFixed(2)}`,
    html,
  });
}

// ── Notification emails ──────────────────────────────────────────────

export async function sendStatusEmail(
  booking: Booking,
  status: "confirmed" | "rejected",
) {
  const transporter = getTransporter();
  const isConfirmed = status === "confirmed";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;color:#e5e5e5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:40px auto;background:#111;border-radius:16px;overflow:hidden;border:1px solid #222">
    <div style="background:${isConfirmed ? "linear-gradient(135deg,#d4af37 0%,#b8962e 100%)" : "#333"};padding:32px;text-align:center">
      <h1 style="margin:0;color:${isConfirmed ? "#000" : "#fff"};font-size:24px;font-weight:700">
        Booking ${isConfirmed ? "Confirmed" : "Declined"}
      </h1>
    </div>
    <div style="padding:32px;text-align:center">
      <p style="font-size:16px;line-height:1.6">
        ${isConfirmed ? `Great news! Your booking from <strong>${booking.pickup}</strong> to <strong>${booking.destination}</strong> has been confirmed. We look forward to seeing you!` : `Your booking from <strong>${booking.pickup}</strong> to <strong>${booking.destination}</strong> has been declined. Feel free to make a new booking anytime.`}
      </p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Premium Chauffeur" <${process.env.SMTP_USER}>`,
    to: booking.clientEmail,
    subject: `Booking ${isConfirmed ? "Confirmed" : "Declined"} \u2014 ${booking.pickup} \u2192 ${booking.destination}`,
    html,
  });
}
