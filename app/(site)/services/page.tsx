import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getServices, txt } from "@/lib/data";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transfer & Chauffeur Services | Airport, Business, VIP",
  description:
    "Professional transfer services in Switzerland: Airport transfers Zurich/Geneva/Basel, business chauffeur, long-distance travel, VIP & event transportation. Available 24/7 with premium Mercedes fleet.",
  keywords: ["airport transfer Zurich", "business chauffeur Switzerland", "VIP transfer", "Flughafentransfer", "transfert aéroport", "трансфер аэропорт"],
  openGraph: {
    title: "Transfer & Chauffeur Services | Elite Chauffeur Switzerland",
    description: "Airport transfers, business chauffeur, VIP transportation in Switzerland. Professional & reliable.",
  },
};

// Rotating icon set — cycled by service index
const SERVICE_ICONS = [
  <svg
    key="plane"
    className="w-10 h-10"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
    />
  </svg>,
  <svg
    key="briefcase"
    className="w-10 h-10"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
    />
  </svg>,
  <svg
    key="map"
    className="w-10 h-10"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
    />
  </svg>,
  <svg
    key="star"
    className="w-10 h-10"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
    />
  </svg>,
];

export default async function ServicesPage() {
  const [services, locale] = await Promise.all([getServices(), getLocale()]);
  const t = getDictionary(locale);

  return (
    <div className="pt-24 pb-16 md:pb-24">
      {/* Header */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 text-center">
          <p className="text-accent text-sm font-semibold uppercase tracking-[0.3em] mb-3">
            {t.servicesPage.subtitle}
          </p>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            {t.servicesPage.title}
          </h1>
          <p className="mt-4 text-muted max-w-xl mx-auto text-lg">
            {t.servicesPage.description}
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="container mx-auto px-6">
        <div className="flex flex-col gap-8">
          {services.map((service, idx) => (
            <div
              key={service.id}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 md:p-10 hover:bg-white/8 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                {service.image ? (
                  <div className="w-full md:w-40 h-32 md:h-40 relative rounded-2xl overflow-hidden shrink-0">
                    <Image
                      src={service.image}
                      alt={txt(service.title, locale)}
                      fill
                      sizes="(max-width: 768px) 100vw, 160px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    {SERVICE_ICONS[idx % SERVICE_ICONS.length]}
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-3">
                    {txt(service.title, locale)}
                  </h2>
                  <p className="text-muted leading-relaxed mb-5">
                    {txt(service.description, locale)}
                  </p>
                  {service.highlights && service.highlights.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {service.highlights.map((h) => (
                        <span
                          key={h}
                          className="flex items-center gap-2 text-sm"
                        >
                          <svg
                            className="w-4 h-4 text-accent shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                          <span className="text-muted">{h}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/booking"
            className="inline-block bg-accent hover:bg-accent-hover text-black font-semibold px-10 py-4 rounded-2xl text-lg transition-all hover:scale-105"
          >
            {t.servicesPage.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
