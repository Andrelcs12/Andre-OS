import type { NorthOverview } from "@/features/north/types/north.types";
import type { DailyRoutine } from "@/features/routines/types/routine.types";
import type { Task } from "@/features/tasks/types/task.types";
import type { TimeEntry } from "@/features/time-tracking/types/time-tracking.types";
import { TodayWorkspace } from "@/features/today/components/today-workspace";
import { serverApiFetch } from "@/lib/api/server-api";
import { getCurrentProfile } from "@/services/profile.service";

async function resource<T>(
  path: string,
): Promise<{ data: T | null; error: boolean }> {
  try {
    const response = await serverApiFetch(path);
    return response.ok
      ? { data: (await response.json()) as T, error: false }
      : { data: null, error: true };
  } catch {
    return { data: null, error: true };
  }
}
export default async function TodayPage() {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza",
  }).format(new Date());
  const [profile, tasks, north, routines, active, analytics] =
    await Promise.all([
      getCurrentProfile(),
      resource<Task[]>(`/tasks?plannedFor=${date}`),
      resource<NorthOverview>("/north"),
      resource<DailyRoutine[]>(`/routines/today?date=${date}`),
      resource<TimeEntry | null>("/time-entries/active"),
      resource<AnalyticsOverview>(
        `/analytics/overview?from=${date}&to=${date}`,
      ),
    ]);
  return (
    <TodayWorkspace
      name={profile?.displayName.split(" ")[0] ?? "André"}
      date={date}
      tasks={tasks.data ?? []}
      north={north.data}
      routines={routines.data ?? []}
      active={active.data}
      todayStats={analytics.data?.summary ?? null}
      errors={{
        tasks: tasks.error,
        north: north.error,
        routines: routines.error,
        active: active.error,
      }}
    />
  );
}

import type { AnalyticsOverview } from "@/features/analytics/types/analytics.types";
