import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Fleet from "@/components/Fleet";
import Services from "@/components/Services";
import Destinations from "@/components/Destinations";
import Image from "next/image";
import Link from "next/link";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Premium Transfer & Taxi Service Switzerland | Luxury Chauffeur",
  description:
    "Elite Chauffeur — luxury transfer & taxi service in Switzerland. Airport transfers Zurich, Geneva, Basel. Mercedes fleet, professional drivers, 24/7 availability. Book your Swiss premium transfer now.",
  keywords: [
    "transfer Switzerland", "Swiss taxi service", "luxury chauffeur Zurich",
    "airport transfer", "VIP transfer", "limousine service",
    "Transfer Schweiz", "Taxi Zürich", "Luxus Chauffeur",
    "transfert Suisse", "taxi luxe", "chauffeur privé",
    "трансфер Швейцария", "такси Цюрих", "VIP трансфер",
  ],
};

export default async function Home() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <>
      <Hero />
      <Fleet />
      <Services />
      <Destinations />

      {/* About Section */}
      <section className="relative min-h-screen md:h-screen overflow-hidden flex flex-col md:flex-row">
        {/* Left - Full bleed image */}
        <div className="w-full md:w-[50vw] h-[40vh] md:h-screen shrink-0 relative">
          <Image
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=80"
            alt="Professional chauffeur"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={75}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent to-black/60" />
        </div>

        {/* Right - Content */}
        <div className="flex-1 flex items-center px-6 py-12 sm:px-10 md:px-16 xl:px-24 relative bg-background">
          <div className="hidden md:block absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="max-w-lg">
            <p className="text-accent text-sm font-semibold uppercase tracking-[0.3em] mb-3">
              {t.about.subtitle}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 sm:mb-8">
              {t.about.title}
              <br />
              <span className="text-accent">{t.about.titleAccent}</span>
            </h2>
            <p className="text-muted text-base sm:text-lg leading-relaxed sm:leading-loose mb-8 sm:mb-10">
              {t.about.description}
            </p>

            {/* Features list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10">
              {[t.about.feat1, t.about.feat2, t.about.feat3, t.about.feat4].map(
                (feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                      <svg
                        className="w-3 h-3 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base">{feature}</span>
                  </div>
                ),
              )}
            </div>

            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-black font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-2xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/20 text-sm sm:text-base"
            >
              {t.about.cta}
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
