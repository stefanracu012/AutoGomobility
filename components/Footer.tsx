import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/40">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold tracking-tight mb-3">
              <span className="text-accent">ELITE</span> CHAUFFEUR
            </h3>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Premium private chauffeur service. Comfort, safety, and precision
              for every journey.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                { href: "/", label: "Home" },
                { href: "/fleet", label: "Our Fleet" },
                { href: "/services", label: "Services" },
                { href: "/booking", label: "Book Now" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              Contact
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-muted">
              <li>
                <a
                  href="tel:+37300000000"
                  className="hover:text-accent transition-colors"
                >
                  +373 000 000 00
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@elitechauffeur.com"
                  className="hover:text-accent transition-colors"
                >
                  info@elitechauffeur.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} Elite Chauffeur. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
