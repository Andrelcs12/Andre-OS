import { createSupabaseServerClient } from "../supabase/server";
import { getApiUrl } from "./api-client";

export async function serverApiFetch(path: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return fetch(`${getApiUrl()}${path}`, {
    headers: {
      Accept: "application/json",
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(3_000),
  });
}
