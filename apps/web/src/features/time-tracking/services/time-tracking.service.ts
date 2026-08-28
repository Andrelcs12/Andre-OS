import { apiFetch } from "@/lib/api/api-client";
import type {
  StartTimeEntryInput,
  TimeEntry,
} from "../types/time-tracking.types";

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
export const getActiveTimeEntry = async () =>
  read<TimeEntry | null>(await apiFetch("/time-entries/active"));
export const listTimeEntries = async (limit = 5) =>
  read<TimeEntry[]>(await apiFetch(`/time-entries?limit=${limit}`));
export const startTimeEntry = async (input: StartTimeEntryInput) =>
  read<TimeEntry>(
    await apiFetch("/time-entries/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
export const stopTimeEntry = async (id: string) =>
  read<TimeEntry>(
    await apiFetch(`/time-entries/${id}/stop`, { method: "POST" }),
  );
