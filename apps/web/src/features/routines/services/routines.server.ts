import { serverApiFetch } from "@/lib/api/server-api";
import type { DailyRoutine, Routine } from "../types/routine.types";
export async function getRoutines() {
  try {
    const r = await serverApiFetch("/routines");
    return r.ok ? ((await r.json()) as Routine[]) : [];
  } catch {
    return [];
  }
}
export async function getDailyRoutines(date: string) {
  try {
    const r = await serverApiFetch(`/routines/today?date=${date}`);
    return r.ok ? ((await r.json()) as DailyRoutine[]) : [];
  } catch {
    return [];
  }
}
