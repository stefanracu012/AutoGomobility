import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/components/LanguageProvider";
import { getLocale } from "@/lib/i18n/server";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <LanguageProvider initialLocale={locale}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </LanguageProvider>
  );
}
