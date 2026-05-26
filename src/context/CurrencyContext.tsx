"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CurrencyCode, ExchangeRates } from "@/lib/currency";
import { CURRENCIES, fetchRates, convertPrice, formatPrice } from "@/lib/currency";

const COOKIE_KEY = "adam-currency";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const VALID_CODES = new Set(CURRENCIES.map((c) => c.code));

const REGION_CURRENCY_MAP: Record<string, CurrencyCode> = {
  GB: "GBP", UK: "GBP",
  US: "USD",
  DE: "EUR", AT: "EUR", NL: "EUR", BE: "EUR", ES: "EUR", PT: "EUR",
  FR: "EUR", IT: "EUR", IE: "EUR", LU: "EUR", FI: "EUR", SK: "EUR",
  CH: "CHF",
  PL: "PLN",
  CZ: "CZK",
};

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
}

function detectBrowserCurrency(): CurrencyCode | null {
  if (typeof navigator === "undefined") return null;
  const languages = navigator.languages ?? [navigator.language];
  for (const lang of languages) {
    const parts = lang.split("-");
    if (parts.length >= 2) {
      const region = parts[parts.length - 1].toUpperCase();
      if (REGION_CURRENCY_MAP[region]) return REGION_CURRENCY_MAP[region];
    }
  }
  return null;
}

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  convert: (amount: number, from: CurrencyCode) => string;
  convertRaw: (amount: number, from: CurrencyCode) => number;
  rates: ExchangeRates | null;
  ready: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "GBP",
  setCurrency: () => {},
  convert: (amount) => `£${amount}`,
  convertRaw: (amount) => amount,
  rates: null,
  ready: false,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("GBP");
  const [rates, setRates] = useState<ExchangeRates | null>(null);

  useEffect(() => {
    const saved = getCookie(COOKIE_KEY) as CurrencyCode | null;
    if (saved && VALID_CODES.has(saved)) {
      setCurrencyState(saved);
    } else {
      const detected = detectBrowserCurrency();
      if (detected) setCurrencyState(detected);
    }
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    setCookie(COOKIE_KEY, code);
  }, []);

  useEffect(() => {
    fetchRates().then(setRates);
  }, []);

  const convert = useCallback(
    (amount: number, from: CurrencyCode): string => {
      if (!rates) return formatPrice(amount, from);
      return formatPrice(convertPrice(amount, from, currency, rates), currency);
    },
    [rates, currency]
  );

  const convertRaw = useCallback(
    (amount: number, from: CurrencyCode): number => {
      if (!rates) return amount;
      return convertPrice(amount, from, currency, rates);
    },
    [rates, currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, convertRaw, rates, ready: !!rates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
