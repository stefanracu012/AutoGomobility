import { cookies } from "next/headers";
import type { Locale } from "./types";

/** Read the user's locale from the `locale` cookie (server components only). */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return (cookieStore.get("locale")?.value ?? "en") as Locale;
}
