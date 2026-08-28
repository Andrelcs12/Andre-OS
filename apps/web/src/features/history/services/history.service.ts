import { apiFetch } from "@/lib/api/api-client";
import type { HistoryEvent, HistoryEventType } from "../types/history.types";

async function read(response: Response) {
  if (response.ok) return response.json() as Promise<HistoryEvent[]>;
  const payload = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  throw new Error(
    Array.isArray(payload?.message)
      ? payload.message.join(" ")
      : payload?.message || "Não foi possível carregar o histórico.",
  );
}
export async function listHistory(type?: HistoryEventType) {
  const query = type ? `?type=${type}` : "";
  return read(await apiFetch(`/history${query}`));
}
