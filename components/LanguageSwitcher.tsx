"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/components/LanguageProvider";
import { LOCALES, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
        aria-label="Change language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="uppercase text-xs font-semibold tracking-wider">
          {current.code}
        </span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[140px]">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLocale(l.code as Locale);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                locale === l.code
                  ? "bg-accent/10 text-accent"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base leading-none">{l.flag}</span>
              <span className="font-medium">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
