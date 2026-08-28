import type { Task, TaskArea } from "@/features/tasks/types/task.types";
export type TimeEntry = {
  id: string;
  taskId: string | null;
  northItemId: string | null;
  task: Pick<Task, "id" | "title"> | null;
  northItem: { id: string; title: string } | null;
  description: string | null;
  area: TaskArea | null;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  createdAt: string;
};
export type StartTimeEntryInput = {
  taskId?: string;
  northItemId?: string;
  description?: string;
  area?: TaskArea;
};
