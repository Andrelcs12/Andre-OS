import { serverApiFetch } from "@/lib/api/server-api";
import type { HistoryEvent } from "../types/history.types";
export async function getHistory() {
  try {
    const response = await serverApiFetch("/history");
    return response.ok ? ((await response.json()) as HistoryEvent[]) : [];
  } catch {
    return [];
  }
}
