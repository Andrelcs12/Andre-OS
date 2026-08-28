import { DailyProgress } from "@/components/dashboard/daily-progress";
import { NextTasks } from "@/components/dashboard/next-tasks";
import { NorthCard } from "@/components/dashboard/north-card";
import { RoutinesCard } from "@/components/dashboard/routines-card";
import { todayMock } from "@/lib/mock/today";
import { getCurrentProfile } from "@/services/profile.service";
import { getTasks } from "@/services/tasks.server";

export default async function TodayPage() {
  const [profile, inProgressTasks, pendingTasks, completedTasks] =
    await Promise.all([
      getCurrentProfile(),
      getTasks({ status: "IN_PROGRESS" }),
      getTasks({ status: "PENDING" }),
      getTasks({ status: "COMPLETED" }),
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
        <NorthCard {...todayMock.north} />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <RoutinesCard routines={todayMock.routines} />
        <NextTasks tasks={nextTasks} />
      </section>
    </div>
  );
}
