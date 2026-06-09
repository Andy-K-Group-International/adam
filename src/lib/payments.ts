// NEXT_PUBLIC_ prefix required so the value is available in client components.
// Set NEXT_PUBLIC_PAYMENTS_ENABLED=true in Vercel to activate payments.
export const paymentsEnabled =
  process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
