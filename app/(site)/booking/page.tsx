import type { Metadata } from "next";
import { Suspense } from "react";
import BookingForm from "@/components/BookingForm";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Book Your Transfer Online | Instant Price & Confirmation",
  description:
    "Book your premium Swiss transfer in seconds. Instant price calculation, real-time online confirmation, professional Mercedes chauffeur. Airport transfers, city rides, long-distance travel, ski transfers. Fixed prices, no hidden fees, free cancellation. Pay cash or card.",
  keywords: [
    "book transfer Switzerland", "book taxi online", "transfer booking",
    "instant price transfer", "online taxi reservation", "book chauffeur",
    "fixed price transfer", "no hidden fees taxi", "free cancellation transfer",
    "book airport transfer Zurich", "reserve limousine Switzerland",
    "quick booking taxi", "last minute transfer", "same day booking",
    "Transfer buchen Schweiz", "Taxi online bestellen", "Chauffeur reservieren",
    "Festpreis Transfer", "Flughafentransfer buchen", "sofort Bestätigung",
    "réserver transfert Suisse", "réservation taxi en ligne", "prix fixe transfert",
    "réserver chauffeur", "confirmation instantanée",
    "prenotare trasferimento", "prenotazione taxi online", "prezzo fisso",
    "prenotare NCC", "conferma immediata",
    "забронировать трансфер", "заказать такси онлайн", "бронирование трансфера",
    "фиксированная цена", "моментальное подтверждение",
  ],
  openGraph: {
    title: "Book Your Transfer | Elite Chauffeur Switzerland",
    description:
      "Book premium Swiss transfers online. Instant price & confirmation.",
  },
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
