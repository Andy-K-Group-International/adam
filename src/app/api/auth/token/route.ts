import { NextResponse } from "next/server";

import { auth0 } from "@/lib/auth0";

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ token: null });
    }
    // Return the ID token for Convex auth (audience matches Auth0 client ID)
    return NextResponse.json({ token: session.tokenSet.idToken ?? null });
  } catch {
    return NextResponse.json({ token: null });
  }
}
