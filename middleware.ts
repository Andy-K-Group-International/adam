import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const auth0 = new Auth0Client();

const publicRoutes = ["/", "/questionnaire", "/api/contact", "/create-account", "/api/auth/create-account"];

function isPublicRoute(pathname: string) {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export default async function middleware(req: NextRequest) {
  // Let Auth0 handle its own routes (/auth/login, /auth/callback, /auth/logout)
  const authResponse = await auth0.middleware(req);
  if (authResponse.status !== 404) {
    return authResponse;
  }

  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) return NextResponse.next();

  // For protected routes, check session
  const session = await auth0.getSession(req);
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)", "/"],
};
