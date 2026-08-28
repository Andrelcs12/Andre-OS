import { apiFetch } from "@/lib/api/api-client";
import type {
  Task,
  TaskFilters,
  TaskInput,
  UpdateTaskInput,
} from "@/types/task";

function toQuery(filters: Partial<TaskFilters> = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

async function readResponse<T>(response: Response): Promise<T> {
  if (response.ok) return (await response.json()) as T;
  const payload = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  const message = Array.isArray(payload?.message)
    ? payload.message.join(" ")
    : payload?.message;
  throw new Error(message || "Não foi possível concluir esta ação.");
}

export async function listTasks(filters: Partial<TaskFilters> = {}) {
  return readResponse<Task[]>(await apiFetch(`/tasks${toQuery(filters)}`));
}
export async function createTask(input: TaskInput) {
  return readResponse<Task>(
    await apiFetch("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}
export async function updateTask(id: string, input: UpdateTaskInput) {
  return readResponse<Task>(
    await apiFetch(`/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}
export async function deleteTask(id: string) {
  const response = await apiFetch(`/tasks/${id}`, { method: "DELETE" });
  if (!response.ok) await readResponse(response);
}
