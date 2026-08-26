const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export function getApiUrl() {
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL não está configurada.");
  }
  return apiUrl;
}

export async function apiFetch(path: string, init?: RequestInit) {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers: { Accept: "application/json", ...init?.headers },
    cache: "no-store",
  });
  return response;
}
