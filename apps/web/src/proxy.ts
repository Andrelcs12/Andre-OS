import { type NextRequest, NextResponse } from "next/server";

import {
  LOCAL_DEV_SESSION_COOKIE,
  LOCAL_DEV_SESSION_VALUE,
} from "@/lib/auth/constants";

const protectedPaths = [
  "/today",
  "/tasks",
  "/routines",
  "/links",
  "/history",
  "/analytics",
];

/**
 * TEMPORARY DEV AUTH route guard. Replace with Supabase Auth in Phase 2.
 * Next.js 16 uses proxy.ts instead of the deprecated middleware.ts convention.
 */
export function proxy(request: NextRequest) {
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );
  const hasSession =
    request.cookies.get(LOCAL_DEV_SESSION_COOKIE)?.value ===
    LOCAL_DEV_SESSION_VALUE;

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (request.nextUrl.pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/today/:path*",
    "/tasks/:path*",
    "/routines/:path*",
    "/links/:path*",
    "/history/:path*",
    "/analytics/:path*",
  ],
};
