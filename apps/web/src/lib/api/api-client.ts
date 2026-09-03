const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export function getApiUrl() {
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não está configurada.");
  }
  return apiUrl;
}

async function getBrowserAccessToken() {
  if (typeof window === "undefined") return undefined;
  const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
  const {
    data: { session },
  } = await createSupabaseBrowserClient().auth.getSession();
  return session?.access_token;
}

export async function apiFetch(path: string, init?: RequestInit) {
  const accessToken = await getBrowserAccessToken();
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
  return response;
}
