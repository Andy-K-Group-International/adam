"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Locale, TranslationKeys } from "@/lib/translations";
import { translations } from "@/lib/translations";

const COOKIE_KEY = "adam-language";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const SUPPORTED_LOCALES: Locale[] = ["en", "sk", "de", "es", "nl", "pt"];

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookieValue(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
}

function detectBrowserLocale(): Locale | null {
  if (typeof navigator === "undefined") return null;
  const languages = navigator.languages ?? [navigator.language];
  for (const lang of languages) {
    const code = lang.toLowerCase().split("-")[0] as Locale;
    if (SUPPORTED_LOCALES.includes(code)) return code;
  }
  return null;
}

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  setLocale: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = getCookie(COOKIE_KEY) as Locale | null;
    if (saved && saved in translations) {
      setLocaleState(saved);
    } else {
      const detected = detectBrowserLocale();
      if (detected) setLocaleState(detected);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setCookieValue(COOKIE_KEY, locale);
      document.documentElement.lang = locale;
    }
  }, [locale, mounted]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
