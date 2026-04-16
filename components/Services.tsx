import Image from "next/image";
import { getServices } from "@/lib/data";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

const SERVICE_ICONS = [
  <svg
    key="0"
    className="w-7 h-7"
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
    key="1"
    className="w-7 h-7"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
    />
  </svg>,
  <svg
    key="2"
    className="w-7 h-7"
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

export default async function Services() {
  const [services, locale] = await Promise.all([getServices(), getLocale()]);
  const t = getDictionary(locale);

  return (
    <section
      id="services"
      className="py-16 sm:py-24 md:py-32 relative overflow-hidden"
    >
      <div className="hidden md:block absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-20">
          <div>
            <p className="text-accent text-sm font-semibold uppercase tracking-[0.3em] mb-4">
              {t.services.subtitle}
            </p>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none">
              {t.services.title}
              <br />
              <span className="text-accent">{t.services.titleAccent}</span>
            </h2>
          </div>
          <p className="text-muted max-w-sm md:text-right leading-relaxed">
            {t.services.description}
          </p>
        </div>

        <div className="divide-y divide-white/[0.08]">
          {services.map((service, idx) => (
            <div
              key={service.id}
              className="group flex items-center gap-6 md:gap-12 py-8 md:py-12 hover:bg-white/[0.02] -mx-6 px-6 transition-colors duration-300 cursor-default"
            >
              <span className="hidden md:block text-7xl lg:text-8xl font-bold text-white/[0.06] group-hover:text-accent/20 transition-colors duration-500 tabular-nums select-none w-28 shrink-0 text-right leading-none">
                {service.number}
              </span>
              {service.image ? (
                <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0 rounded-full overflow-hidden relative">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0 rounded-full border border-white/10 group-hover:border-accent/40 text-white/40 group-hover:text-accent flex items-center justify-center transition-all duration-400">
                  {SERVICE_ICONS[idx % SERVICE_ICONS.length]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold group-hover:text-accent transition-colors duration-300">
                    {service.title}
                  </h3>
                  <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-widest text-accent/70 bg-accent/10 px-2.5 py-1 rounded-full">
                    {service.tag}
                  </span>
                </div>
                <p className="text-muted leading-relaxed max-w-xl">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
