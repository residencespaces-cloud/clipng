import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = ["/clipper", "/funder", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Client stores tokens in localStorage; middleware only blocks unauthenticated
  // deep-links when no session hint cookie is present. AuthProvider handles real checks.
  const hasSession = request.cookies.get("clipng_session")?.value === "1";
  if (!hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/clipper/:path*", "/funder/:path*", "/admin/:path*"],
};
