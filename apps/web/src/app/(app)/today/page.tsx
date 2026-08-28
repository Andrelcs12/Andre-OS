import { DailyProgress } from "@/components/dashboard/daily-progress";
import { NextTasks } from "@/components/dashboard/next-tasks";
import { WeeklySummary } from "@/features/analytics/components/weekly-summary";
import { getAnalyticsOverview } from "@/features/analytics/services/analytics.server";
import { NorthTodayCard } from "@/features/north/components/north-today-card";
import { getNorthOverview } from "@/features/north/services/north.server";
import { DailyRoutines } from "@/features/routines/components/daily-routines";
import { getDailyRoutines } from "@/features/routines/services/routines.server";
import { getTasks } from "@/features/tasks/services/tasks.server";
import { TimeTrackingPanel } from "@/features/time-tracking/components/time-tracking-panel";
import {
  getActiveTimeEntry,
  getTimeEntries,
} from "@/features/time-tracking/services/time-tracking.server";
import { getCurrentProfile } from "@/services/profile.service";

export default async function TodayPage() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const [
    profile,
    inProgressTasks,
    pendingTasks,
    completedTasks,
    routines,
    activeEntry,
    recentEntries,
    north,
    weeklyAnalytics,
  ] = await Promise.all([
    getCurrentProfile(),
    getTasks({ status: "IN_PROGRESS" }),
    getTasks({ status: "PENDING" }),
    getTasks({ status: "COMPLETED" }),
    getDailyRoutines(new Date().toISOString().slice(0, 10)),
    getActiveTimeEntry(),
    getTimeEntries(),
    getNorthOverview(),
    getAnalyticsOverview(
      monday.toISOString().slice(0, 10),
      sunday.toISOString().slice(0, 10),
    ),
  ]);
  const firstName = profile?.displayName.split(" ")[0] ?? "André";
  const today = new Date().toISOString().slice(0, 10);
  const dueToday = [
    ...pendingTasks,
    ...inProgressTasks,
    ...completedTasks,
  ].filter((task) => task.dueDate?.slice(0, 10) === today);
  const completedToday = completedTasks.filter(
    (task) => task.completedAt?.slice(0, 10) === today,
  ).length;
  const nextTasks = [...inProgressTasks, ...pendingTasks].slice(0, 5);
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-primary">
          {new Intl.DateTimeFormat("pt-BR", {
            day: "numeric",
            month: "long",
          }).format(new Date())}
        </p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">
          Boa tarde, {firstName}.
        </h2>
        <p className="mt-2 text-muted-foreground">Aqui está o seu dia.</p>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <DailyProgress completed={completedToday} total={dueToday.length} />
        <NorthTodayCard initial={north} />
      </section>
      <WeeklySummary data={weeklyAnalytics} />
      <section className="grid gap-4 lg:grid-cols-2">
        <DailyRoutines initialRoutines={routines} date={today} />
        <NextTasks tasks={nextTasks} />
      </section>
      <TimeTrackingPanel
        initialActive={activeEntry}
        initialEntries={recentEntries}
        tasks={[...inProgressTasks, ...pendingTasks]}
      />
    </div>
  );
}
