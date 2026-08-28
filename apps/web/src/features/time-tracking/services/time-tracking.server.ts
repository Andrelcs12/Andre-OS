import { serverApiFetch } from "@/lib/api/server-api";
import type { TimeEntry } from "../types/time-tracking.types";
export async function getTimeEntries(limit = 5) {
  try {
    const response = await serverApiFetch(`/time-entries?limit=${limit}`);
    return response.ok ? ((await response.json()) as TimeEntry[]) : [];
  } catch {
    return [];
  }
}
export async function getActiveTimeEntry() {
  try {
    const response = await serverApiFetch("/time-entries/active");
    return response.ok ? ((await response.json()) as TimeEntry | null) : null;
  } catch {
    return null;
  }
}
