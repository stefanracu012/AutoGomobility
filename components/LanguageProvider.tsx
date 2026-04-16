"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getDictionary, type Locale, type Dict } from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  t: Dict;
  setLocale: (l: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (l: Locale) => {
      setLocaleState(l);
      // Persist to cookie (1 year)
      document.cookie = `locale=${l};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
      // Trigger server component re-render
      router.refresh();
    },
    [router],
  );

  const t = getDictionary(locale);

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be inside LanguageProvider");
  return ctx;
}
