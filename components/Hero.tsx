import BookingCalculator from "@/components/BookingCalculator";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1920&q=80')",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background z-[1]" />

      {/* Decorative elements */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] z-[2]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] z-[2]" />

      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20 flex flex-col items-center gap-16">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-center">
          Premium <span className="text-accent">Chauffeur</span> Service
        </h1>
        <div className="w-full max-w-5xl">
          <BookingCalculator />
        </div>
      </div>
    </section>
  );
}
