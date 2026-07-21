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
  // #region agent log
  fetch("http://127.0.0.1:7702/ingest/7d7698e3-42d0-49ee-83ba-8f42b016a321", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "0731d3",
    },
    body: JSON.stringify({
      sessionId: "0731d3",
      runId: "run1",
      hypothesisId: "H1",
      location: "src/middleware.ts:13",
      message: "Protected route middleware check",
      data: {
        pathname,
        isProtected,
        hasSession,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
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
