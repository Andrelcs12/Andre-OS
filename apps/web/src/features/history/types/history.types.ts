import type { TaskArea } from "@/features/tasks/types/task.types";
export type HistoryEventType =
  | "TASK_COMPLETED"
  | "ROUTINE_COMPLETED"
  | "TIME_ENTRY";
export type HistoryEvent = {
  id: string;
  type: HistoryEventType;
  occurredAt: string;
  title: string;
  description: string | null;
  area: TaskArea | null;
  metadata: {
    taskId?: string;
    routineId?: string;
    timeEntryId?: string;
    durationMinutes?: number;
  };
};
