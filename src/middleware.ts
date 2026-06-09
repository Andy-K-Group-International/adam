import { NextResponse, type NextRequest } from "next/server";

// Route protection is handled at layout level (server components).
// This middleware is intentionally minimal for v1.0.
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
