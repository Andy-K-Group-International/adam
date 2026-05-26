export type CurrencyCode = "GBP" | "EUR" | "USD" | "CHF" | "PLN" | "CZK";

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: "GBP", symbol: "£",  label: "GBP (£)" },
  { code: "EUR", symbol: "€",  label: "EUR (€)" },
  { code: "USD", symbol: "$",  label: "USD ($)" },
  { code: "CHF", symbol: "Fr", label: "CHF (Fr)" },
  { code: "PLN", symbol: "zł", label: "PLN (zł)" },
  { code: "CZK", symbol: "Kč", label: "CZK (Kč)" },
];

export type ExchangeRates = Record<CurrencyCode, number>;

// Fallback rates (USD = 1 base)
const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  CHF: 0.90,
  PLN: 4.00,
  CZK: 23.50,
};

const CURRENCY_CODES = CURRENCIES.map((c) => c.code).join(",");

export async function fetchRates(): Promise<ExchangeRates> {
  const key = process.env.NEXT_PUBLIC_FREECURRENCY_API_KEY;
  if (!key) return FALLBACK_RATES;
  try {
    const res = await fetch(
      `https://api.freecurrencyapi.com/v1/latest?apikey=${key}&currencies=${CURRENCY_CODES}`
    );
    if (!res.ok) return FALLBACK_RATES;
    const json = await res.json();
    return json.data as ExchangeRates;
  } catch {
    return FALLBACK_RATES;
  }
}

export function convertPrice(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: ExchangeRates
): number {
  if (from === to) return amount;
  const amountInUsd = amount / rates[from];
  return amountInUsd * rates[to];
}

export function formatPrice(amount: number, currency: CurrencyCode): string {
  const info = CURRENCIES.find((c) => c.code === currency)!;
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString("en-US");
  if (currency === "PLN" || currency === "CZK") return `${formatted} ${info.symbol}`;
  return `${info.symbol}${formatted}`;
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCIES.find((c) => c.code === currency)?.symbol ?? "£";
}

/** Hourly rate slider config per currency */
export const HOURLY_RATE_CONFIG: Record<CurrencyCode, { min: number; max: number; step: number; default: number }> = {
  GBP: { min: 50,   max: 500,   step: 10,  default: 150 },
  EUR: { min: 60,   max: 600,   step: 10,  default: 175 },
  USD: { min: 60,   max: 600,   step: 10,  default: 175 },
  CHF: { min: 60,   max: 600,   step: 10,  default: 170 },
  PLN: { min: 250,  max: 2500,  step: 50,  default: 700 },
  CZK: { min: 1500, max: 15000, step: 500, default: 4000 },
};

/** ADAM Growth plan monthly price in GBP — base for ROI conversion */
export const ADAM_COST_GBP = 699;
