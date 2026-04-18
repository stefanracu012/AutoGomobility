import Image from "next/image";
import BookingCalculator from "@/components/BookingCalculator";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";
import { getSiteConfig } from "@/lib/data";

export default async function Hero() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const cfg = await getSiteConfig();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image — optimized with next/image */}
      <Image
        src={cfg.heroImage}
        alt="Luxury chauffeur service"
        fill
        sizes="100vw"
        priority
        quality={75}
        className="object-cover object-center"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background z-[1]" />

      {/* Decorative elements — desktop only to save mobile GPU */}
      <div className="hidden md:block absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] z-[2]" />
      <div className="hidden md:block absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] z-[2]" />

      <div className="relative z-10 container mx-auto px-6 pt-24 pb-12 sm:pt-32 sm:pb-20 flex flex-col items-center gap-8 sm:gap-16">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-center">
          {t.hero.line1}
          <span className="text-accent">{t.hero.accent}</span>
          {t.hero.line2}
        </h1>
        <div className="w-full max-w-5xl">
          <BookingCalculator />
        </div>
      </div>
    </section>
  );
}
