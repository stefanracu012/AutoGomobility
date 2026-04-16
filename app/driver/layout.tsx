import { LanguageProvider } from "@/components/LanguageProvider";
import { getLocale } from "@/lib/i18n/server";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>;
}
