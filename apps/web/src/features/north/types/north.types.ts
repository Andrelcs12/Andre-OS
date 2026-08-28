import type { TaskArea } from "@/features/tasks/types/task.types";
export type NorthStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type NorthItem = {
  id: string;
  trackId: string;
  title: string;
  description: string | null;
  status: NorthStatus;
  position: number;
  plannedMinutes: number | null;
  scheduledDate: string | null;
  completedAt: string | null;
  trackedMinutes: number;
};
export type NorthTrack = {
  id: string;
  title: string;
  description: string | null;
  area: TaskArea | null;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  targetDate: string | null;
};
export type NorthOverview = {
  track: NorthTrack | null;
  items: NorthItem[];
  currentItem: NorthItem | null;
};
