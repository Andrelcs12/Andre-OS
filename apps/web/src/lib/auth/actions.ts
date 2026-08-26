"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  LOCAL_DEV_SESSION_COOKIE,
  localDevSessionCookie,
} from "@/lib/auth/local-session";

/** TEMPORARY DEV AUTH. Replace with Supabase Auth in Phase 2. */
export async function startLocalDevSession() {
  const cookieStore = await cookies();
  cookieStore.set(
    localDevSessionCookie.name,
    localDevSessionCookie.value,
    localDevSessionCookie.options,
  );
  redirect("/today");
}

/** TEMPORARY DEV AUTH. Replace with Supabase Auth in Phase 2. */
export async function endLocalDevSession() {
  const cookieStore = await cookies();
  cookieStore.delete(LOCAL_DEV_SESSION_COOKIE);
  redirect("/login");
}
