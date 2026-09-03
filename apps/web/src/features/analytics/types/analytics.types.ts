import type { TaskArea } from "@/features/tasks/types/task.types";
export type AnalyticsOverview = {
  range: { from: string; to: string };
  summary: {
    tasksCompleted: number;
    routinePlanned: number;
    routineCompleted: number;
    routineCompletionRate: number | null;
    trackedMinutes: number;
    trackedSessions: number;
    averageSessionMinutes: number;
    longestSessionMinutes: number;
  };
  daily: Array<{
    date: string;
    tasksCompleted: number;
    routinesCompleted: number;
    routinesPlanned: number;
    trackedMinutes: number;
  }>;
  areas: Array<{
    area: TaskArea;
    tasksCompleted: number;
    trackedMinutes: number;
  }>;
  comparison: {
    previousRange: { from: string; to: string };
    previous: AnalyticsOverview["summary"];
    delta: {
      tasksCompleted: number;
      trackedMinutes: number;
      trackedSessions: number;
      routineCompletionRatePoints: number | null;
    };
  };
};
