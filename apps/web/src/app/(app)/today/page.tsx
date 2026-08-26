import { DailyProgress } from "@/components/dashboard/daily-progress";
import { NextTasks } from "@/components/dashboard/next-tasks";
import { NorthCard } from "@/components/dashboard/north-card";
import { RoutinesCard } from "@/components/dashboard/routines-card";
import { todayMock } from "@/lib/mock/today";
import { getCurrentProfile } from "@/services/profile.service";

export default async function TodayPage() {
  const profile = await getCurrentProfile();
  const firstName = profile?.displayName.split(" ")[0] ?? "André";
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-primary">26 de agosto</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">
          Boa tarde, {firstName}.
        </h2>
        <p className="mt-2 text-muted-foreground">Aqui está o seu dia.</p>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <DailyProgress
          completed={todayMock.completedTasks}
          total={todayMock.totalTasks}
        />
        <NorthCard {...todayMock.north} />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <RoutinesCard routines={todayMock.routines} />
        <NextTasks tasks={todayMock.nextTasks} />
      </section>
    </div>
  );
}
