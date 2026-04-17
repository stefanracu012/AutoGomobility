import type { Metadata } from "next";
import Image from "next/image";
import { getFleet, txt } from "@/lib/data";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Fleet | Elite Chauffeur",
  description:
    "Explore our premium fleet of Mercedes and BMW vehicles. From sedans to SUVs, find the perfect vehicle for your journey.",
};

export default async function FleetPage() {
  const [fleet, locale] = await Promise.all([getFleet(), getLocale()]);
  const t = getDictionary(locale);

  return (
    <div className="pt-24 pb-16 md:pb-24">
      {/* Header */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <p className="text-accent text-sm font-semibold uppercase tracking-[0.3em] mb-3">
            {t.fleetPage.subtitle}
          </p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            {t.fleetPage.title}
          </h1>
          <p className="mt-4 text-muted max-w-xl mx-auto text-lg">
            {t.fleetPage.description}
          </p>
        </div>
      </section>

      {/* Fleet grid */}
      <section className="container mx-auto px-6">
        <div className="flex flex-col gap-10">
          {fleet.map((car, i) => (
            <div
              key={car.id}
              className={`bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              } md:flex`}
            >
              <div className="md:w-1/2 relative min-h-[45vh] sm:min-h-[320px] md:min-h-[280px]">
                <Image
                  src={car.image}
                  alt={txt(car.name, locale)}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority={i < 2}
                />
              </div>
              <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                <span className="text-xs font-medium text-accent uppercase tracking-wider">
                  {txt(car.category, locale)}
                </span>
                <h2 className="mt-2 text-3xl font-bold">
                  {txt(car.name, locale)}
                </h2>
                <p className="mt-3 text-muted leading-relaxed">
                  {txt(car.description, locale)}
                </p>

                {(car.passengers || car.luggage) && (
                  <div className="mt-5 flex gap-4 text-sm text-muted">
                    {car.passengers && (
                      <span className="flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4 text-accent"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                          />
                        </svg>
                        {txt(car.passengers, locale)}
                      </span>
                    )}
                    {car.luggage && (
                      <span className="flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4 text-accent"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                          />
                        </svg>
                        {txt(car.luggage, locale)}
                      </span>
                    )}
                  </div>
                )}

                {car.priceLabel && (
                  <p className="mt-3 text-sm text-accent/70">
                    {txt(car.priceLabel, locale)}
                  </p>
                )}

                {car.features && car.features.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {car.features.map((f) => (
                      <span
                        key={f}
                        className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-muted"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
