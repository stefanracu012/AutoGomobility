import Link from "next/link";
import Image from "next/image";
import { getFleet } from "@/lib/data";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

export default async function Fleet() {
  const [fleet, locale] = await Promise.all([getFleet(), getLocale()]);
  const t = getDictionary(locale);

  return (
    <section id="fleet" className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="hidden md:block absolute -top-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-6 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <p className="text-accent text-sm font-semibold uppercase tracking-[0.3em] mb-3">
              {t.fleet.subtitle}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              {t.fleet.title}
              <br />
              <span className="text-accent">{t.fleet.titleAccent}</span>
            </h2>
          </div>
          <p className="text-muted max-w-md md:text-right">
            {t.fleet.description}
          </p>
        </div>
      </div>

      {/* 2 cars visible per screen height — full viewport width */}
      <div className="grid grid-cols-1 gap-0">
        {fleet.map((car, index) => (
          <div
            key={car.name}
            className="group grid grid-cols-1 md:grid-cols-2 h-[50vh] min-h-[260px] bg-white/[0.03] backdrop-blur-sm border-y border-white/10 overflow-hidden hover:bg-white/[0.06] transition-all duration-500"
          >
            {/* Image — alternate left/right */}
            <div
              className={`relative overflow-hidden ${index % 2 === 1 ? "md:order-2" : ""}`}
            >
              <Image
                src={car.image}
                alt={car.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority={index < 2}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
              <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-accent text-xs font-semibold px-3 py-1.5 rounded-full z-10">
                {car.priceLabel}
              </span>
            </div>

            {/* Text */}
            <div
              className={`flex flex-col justify-center px-5 sm:px-10 md:px-20 py-6 sm:py-8 ${index % 2 === 1 ? "md:order-1" : ""}`}
            >
              <span className="inline-block text-xs font-semibold text-accent uppercase tracking-wider bg-accent/10 px-2.5 py-1 rounded-full w-fit">
                {car.category}
              </span>
              <h3 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold">
                {car.name}
              </h3>
              <p className="mt-3 text-muted leading-relaxed max-w-sm">
                {car.description}
              </p>
              <Link
                href="/booking"
                className="mt-6 inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all w-fit"
              >
                {t.fleet.bookVehicle}
                <svg
                  className="w-4 h-4"
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
        ))}
      </div>

      {/* CTA button */}
      <div className="flex justify-center mt-16">
        <Link
          href="/fleet"
          className="inline-flex items-center gap-2 sm:gap-3 bg-accent text-black font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-full hover:bg-accent/90 transition-all duration-300 hover:scale-105 shadow-lg shadow-accent/20 text-xs sm:text-sm uppercase tracking-widest"
        >
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
              d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
            />
          </svg>
          {t.fleet.viewFleet}
        </Link>
      </div>
    </section>
  );
}
