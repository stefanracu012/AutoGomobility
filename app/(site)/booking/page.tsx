import type { Metadata } from "next";
import { Suspense } from "react";
import BookingForm from "@/components/BookingForm";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Book a Ride | Elite Chauffeur",
  description:
    "Book your premium chauffeur service. Fill in your details and we will confirm your ride within minutes.",
};

export default async function BookingPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="pt-24 pb-16 md:pb-24">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-accent text-sm font-semibold uppercase tracking-[0.3em] mb-3">
              {t.bookingPage.subtitle}
            </p>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              {t.bookingPage.title}
            </h1>
            <p className="mt-4 text-muted max-w-xl mx-auto text-lg">
              {t.bookingPage.description}
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Suspense
              fallback={
                <div className="h-96 animate-pulse bg-white/5 rounded-2xl" />
              }
            >
              <BookingForm />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
