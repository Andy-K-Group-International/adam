import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

// Timing-safe Bearer-token check for Vercel cron routes, matching the
// pattern already used correctly for the Revolut webhook signature check.
// A plain === comparison leaks timing information proportional to how many
// leading characters match; CRON_SECRET is currently set in production so
// this isn't live-exploitable today, but it's the same class of gap.
export function cronAuth(req: NextRequest): boolean {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const secret = process.env.CRON_SECRET;
  if (!token || !secret) return false;

  const tokenBuf = Buffer.from(token);
  const secretBuf = Buffer.from(secret);
  if (tokenBuf.length !== secretBuf.length) return false;

  return timingSafeEqual(tokenBuf, secretBuf);
}
