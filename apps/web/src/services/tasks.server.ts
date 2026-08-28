import { serverApiFetch } from "@/lib/api/server-api";
import type { Task, TaskFilters } from "@/types/task";

function toQuery(filters: Partial<TaskFilters> = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getTasks(filters: Partial<TaskFilters> = {}) {
  try {
    const response = await serverApiFetch(`/tasks${toQuery(filters)}`);
    if (!response.ok) return [];
    return (await response.json()) as Task[];
  } catch {
    return [];
  }
}
