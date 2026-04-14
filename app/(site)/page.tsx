import Hero from "@/components/Hero";
import Fleet from "@/components/Fleet";
import Services from "@/components/Services";
import Destinations from "@/components/Destinations";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <Fleet />
      <Services />
      <Destinations />

      {/* About Section */}
      <section className="relative h-screen overflow-hidden flex">
        {/* Left - Full bleed image */}
        <div className="w-[50vw] h-screen shrink-0 relative">
          <Image
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=80"
            alt="Professional chauffeur"
            fill
            sizes="50vw"
            quality={75}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60" />
        </div>

        {/* Right - Content */}
        <div className="flex-1 flex items-center px-16 xl:px-24 relative bg-background">
          <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="max-w-lg">
            <p className="text-accent text-sm font-semibold uppercase tracking-[0.3em] mb-3">
              About Us
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8">
              Your Trusted
              <br />
              <span className="text-accent">Chauffeur Partner</span>
            </h2>
            <p className="text-muted text-lg leading-loose mb-10">
              Private chauffeur with years of experience, offering reliable and
              premium transportation services. Every ride is treated with the
              utmost professionalism, ensuring your comfort and safety from
              pickup to destination.
            </p>

            {/* Features list */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {[
                "Professional drivers",
                "Premium vehicles",
                "24/7 availability",
                "Fixed pricing",
              ].map((feature) => (
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
                  <span className="text-base">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-black font-semibold px-8 py-4 rounded-2xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/20"
            >
              Book Your Ride
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
