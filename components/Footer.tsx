"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/components/LanguageProvider";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/5 bg-black/40">
      <div className="container mx-auto px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image
                src="/taxi.png"
                alt="Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <h3 className="text-lg font-bold tracking-tight">
                <span className="text-accent">ELITE</span> CHAUFFEUR
              </h3>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              {t.footer.description}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted mb-4">
              {t.footer.quickLinks}
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                { href: "/", label: t.footer.home },
                { href: "/fleet", label: t.footer.ourFleet },
                { href: "/services", label: t.footer.services },
                { href: "/booking", label: t.footer.bookNow },
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
              {t.footer.contact}
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-muted">
              <li>
                <a
                  href="tel:+41766298355"
                  className="hover:text-accent transition-colors"
                >
                  +41 76 629 83 55
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/41766298355"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="mailto:dumbravaautogomobility@gmail.com"
                  className="hover:text-accent transition-colors break-all"
                >
                  dumbravaautogomobility@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 text-center text-xs text-muted">
          &copy; {new Date().getFullYear()} {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
