import { cookies } from "next/headers";

import {
  LOCAL_DEV_SESSION_COOKIE,
  LOCAL_DEV_SESSION_VALUE,
} from "@/lib/auth/constants";

export { LOCAL_DEV_SESSION_COOKIE } from "@/lib/auth/constants";

/**
 * TEMPORARY DEV AUTH. Replace with Supabase Auth in Phase 2.
 * This is intentionally not a production authentication mechanism.
 */
export async function getLocalDevSession() {
  const cookieStore = await cookies();
  return (
    cookieStore.get(LOCAL_DEV_SESSION_COOKIE)?.value === LOCAL_DEV_SESSION_VALUE
  );
}

export const localDevSessionCookie = {
  name: LOCAL_DEV_SESSION_COOKIE,
  value: LOCAL_DEV_SESSION_VALUE,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  },
};
