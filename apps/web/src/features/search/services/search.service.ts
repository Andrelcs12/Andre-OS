import { apiFetch } from "@/lib/api/api-client";
import type { SearchResult } from "../types/search.types";

export async function search(query: string) {
  const response = await apiFetch(`/search?q=${encodeURIComponent(query)}`);
  if (response.ok) return (await response.json()) as SearchResult[];
  const payload = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  const message = Array.isArray(payload?.message)
    ? payload.message.join(" ")
    : payload?.message;
  throw new Error(message || "Não foi possível realizar a busca.");
}
