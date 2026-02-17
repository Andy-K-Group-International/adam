import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

const auth0 = new Auth0Client();

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
