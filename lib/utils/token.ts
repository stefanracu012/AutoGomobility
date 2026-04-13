import { randomBytes } from "crypto";

/** Generate a URL-safe random token for booking confirm/reject links */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}
