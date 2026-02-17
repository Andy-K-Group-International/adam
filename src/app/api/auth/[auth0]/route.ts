// Auth0 v4 handles auth routes via middleware, not route handlers.
// The Auth0Client.middleware() handles /auth/login, /auth/callback, /auth/logout automatically.
// This file exists only as a fallback.
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({ error: "Auth routes handled by middleware" }, { status: 404 });
}
