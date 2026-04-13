import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_token";
const EXPIRES_IN = "8h";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env var is not set");
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(getSecret());
}

export async function verifyAdminToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

/** Read admin token from the incoming request's cookies (server-side) */
export async function getAdminTokenFromCookies(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value ?? null;
}

/** Check whether the current request is authenticated */
export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getAdminTokenFromCookies();
  if (!token) return false;
  const payload = await verifyAdminToken(token);
  return payload?.role === "admin";
}

export { COOKIE_NAME };
