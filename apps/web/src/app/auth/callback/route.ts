import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  if (!code)
    return NextResponse.redirect(
      new URL("/login?error=oauth_cancelled", requestUrl.origin),
    );
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(
    new URL(
      error ? "/login?error=oauth_callback" : "/today",
      requestUrl.origin,
    ),
  );
}
