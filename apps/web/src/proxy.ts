import { type NextRequest, NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/proxy";

const protectedPaths = [
  "/today",
  "/tasks",
  "/routines",
  "/links",
  "/history",
  "/analytics",
];
function isProtectedPath(pathname: string) {
  return protectedPaths.some((path) => pathname.startsWith(path));
}
function redirectWithCookies(url: URL, source: NextResponse) {
  const response = NextResponse.redirect(url);
  source.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie);
  });
  return response;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!isSupabaseConfigured())
    return isProtectedPath(pathname)
      ? NextResponse.redirect(new URL("/login", request.url))
      : NextResponse.next();
  const { claims, response } = await updateSession(request);
  const isAuthenticated = Boolean(claims?.sub);
  if (isProtectedPath(pathname) && !isAuthenticated)
    return redirectWithCookies(new URL("/login", request.url), response);
  if (pathname === "/login" && isAuthenticated)
    return redirectWithCookies(new URL("/today", request.url), response);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
