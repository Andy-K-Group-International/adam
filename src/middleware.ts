import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { auth0 } from "@/lib/auth0";

export const runtime = "nodejs";

const publicRoutes = [
  "/",
  "/questionnaire",
  "/api/contact",
  "/create-account",
  "/api/auth/create-account",
  "/api/auth/token",
];

function isPublicRoute(pathname: string) {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export async function middleware(req: NextRequest) {
  // Let Auth0 handle its auth routes (/auth/login, /auth/callback, /auth/logout)
  const authResponse = await auth0.middleware(req);

  const { pathname } = req.nextUrl;

  // If the request is for an auth route, Auth0 handles it
  if (pathname.startsWith("/auth/")) {
    return authResponse;
  }

  // Public routes — no auth required
  if (isPublicRoute(pathname)) {
    return authResponse;
  }

  // Protected routes — check session
  const session = await auth0.getSession(req);
  if (!session) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return authResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)", "/"],
};
