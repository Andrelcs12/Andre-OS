import { apiFetch } from "@/lib/api/api-client";
import type { Link, LinkFilters, LinkInput } from "../types/link.types";

async function read<T>(response: Response): Promise<T> {
  if (response.ok) return response.json() as Promise<T>;
  const payload = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  throw new Error(
    Array.isArray(payload?.message)
      ? payload.message.join(" ")
      : payload?.message || "Não foi possível concluir esta ação.",
  );
}
function query(filters: LinkFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  return params.size ? `?${params}` : "";
}
export const listLinks = async (filters?: LinkFilters) =>
  read<Link[]>(await apiFetch(`/links${query(filters)}`));
export const createLink = async (input: LinkInput) =>
  read<Link>(
    await apiFetch("/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
export const updateLink = async (id: string, input: Partial<LinkInput>) =>
  read<Link>(
    await apiFetch(`/links/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
export async function deleteLink(id: string) {
  const response = await apiFetch(`/links/${id}`, { method: "DELETE" });
  if (!response.ok) await read(response);
}
