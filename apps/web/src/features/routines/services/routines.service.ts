import { apiFetch } from "@/lib/api/api-client";
import type { Routine, RoutineInput } from "../types/routine.types";

async function read<T>(r: Response): Promise<T> {
  if (r.ok) return (await r.json()) as T;
  throw new Error("Não foi possível concluir esta ação.");
}
export async function createRoutine(input: RoutineInput) {
  return read<Routine>(
    await apiFetch("/routines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}
export async function updateRoutine(id: string, input: Partial<RoutineInput>) {
  return read<Routine>(
    await apiFetch(`/routines/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}
export async function deleteRoutine(id: string) {
  const r = await apiFetch(`/routines/${id}`, { method: "DELETE" });
  if (!r.ok) await read(r);
}
export async function setRoutineEntry(
  id: string,
  date: string,
  completed: boolean,
) {
  return read<{ completed: boolean; completedAt: string | null }>(
    await apiFetch(`/routines/${id}/entries/${date}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    }),
  );
}
