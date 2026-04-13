import type { Metadata } from "next";
import { Suspense } from "react";
import BookingForm from "@/components/BookingForm";

export const metadata: Metadata = {
  title: "Book a Ride | Elite Chauffeur",
  description:
    "Book your premium chauffeur service. Fill in your details and we will confirm your ride within minutes.",
};

export default function BookingPage() {
  return (
    <div className="pt-24 pb-16 md:pb-24">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-accent text-sm font-semibold uppercase tracking-[0.3em] mb-3">
              Reservation
            </p>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Book Your Ride
            </h1>
            <p className="mt-4 text-muted max-w-xl mx-auto text-lg">
              Fill out the form below and we will get back to you within minutes
              to confirm your booking.
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
