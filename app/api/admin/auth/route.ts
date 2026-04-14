import { NextRequest, NextResponse } from "next/server";
import { signAdminToken, COOKIE_NAME } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const validEmail = email === process.env.ADMIN_EMAIL;
  const validPassword = password === process.env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = await signAdminToken();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // secure: true — enable in production (HTTPS only)
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}

/** Called on page load to check if the current session is still valid */
export async function GET() {
  // The cookie check is done client-side via /api/admin/data — 
  // but we expose a lightweight endpoint here too.
  const { isAdminAuthenticated } = await import("@/lib/admin-auth");
  const ok = await isAdminAuthenticated();
  return NextResponse.json({ ok });
}
