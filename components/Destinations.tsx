import { calculatePrice } from "@/lib/price";
import { getDestinations, getPricing } from "@/lib/data";
import Link from "next/link";

function buildBookingUrl(from: string, to: string) {
  const p = new URLSearchParams({
    pickup: from,
    destination: to,
    vehicle: "business",
  });
  return `/booking?${p.toString()}`;
}

export default async function Destinations() {
  const routes = await getDestinations();
  const pricing = await getPricing();
  return (
    <section
      id="destinations"
      className="py-24 md:py-32 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <p className="text-accent text-sm font-semibold uppercase tracking-[0.3em] mb-3">
              Popular Routes
            </p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Top <span className="text-accent">Destinations</span>
            </h2>
          </div>
          <p className="text-muted max-w-md md:text-right">
            Fixed-price routes for the most popular destinations. No surprises,
            just transparent pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => {
            const price = calculatePrice({
              distance: route.distance,
              vehicle: "business",
              rates: pricing,
            });
            const discountedPrice = route.discount
              ? price * (1 - route.discount / 100)
              : null;

            return (
              <Link
                href={buildBookingUrl(route.from, route.to)}
                key={`${route.from}-${route.to}`}
                className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.06] hover:border-accent/30 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/10 block"
              >
                {route.discount && (
                  <span className="absolute -top-3 -right-3 bg-gradient-to-r from-accent to-accent-hover text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    -{route.discount}% OFF
                  </span>
                )}

                <div className="flex items-center gap-4 mb-5">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted uppercase tracking-wider">
                      From
                    </span>
                    <span className="text-lg font-bold">{route.from}</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex-1 h-px bg-gradient-to-r from-white/20 via-accent/50 to-white/20" />
                    <svg
                      className="w-6 h-6 text-accent mx-2 group-hover:translate-x-1 transition-transform"
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
                    <div className="flex-1 h-px bg-gradient-to-r from-white/20 via-accent/50 to-white/20" />
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-muted uppercase tracking-wider">
                      To
                    </span>
                    <span className="text-lg font-bold">{route.to}</span>
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted mb-1">
                      {route.distance} km
                    </p>
                    <p className="text-xs text-muted">Business Class</p>
                  </div>
                  <div className="text-right">
                    {discountedPrice ? (
                      <>
                        <span className="text-sm text-muted line-through block">
                          &euro;{price.toFixed(0)}
                        </span>
                        <span className="text-3xl font-bold text-accent">
                          &euro;{discountedPrice.toFixed(0)}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-accent">
                        &euro;{price.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-accent font-medium flex items-center gap-1">
                  Book this route
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
