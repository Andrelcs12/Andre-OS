import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import { RoutineSchedule, TaskStatus } from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import type { AnalyticsRangeQueryDto } from "./dto/analytics-range-query.dto.js";

const day = (value: Date) => value.toISOString().slice(0, 10);
const rangeDates = (from: string, to: string) => {
  const dates: Date[] = [];
  const start = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);
  if (
    Number.isNaN(start.valueOf()) ||
    Number.isNaN(end.valueOf()) ||
    start > end
  )
    throw new BadRequestException("Intervalo inválido.");
  for (
    let value = new Date(start);
    value <= end;
    value.setUTCDate(value.getUTCDate() + 1)
  )
    dates.push(new Date(value));
  if (dates.length > 31)
    throw new BadRequestException("O intervalo máximo é de 31 dias.");
  return dates;
};
const scheduled = (
  schedule: RoutineSchedule,
  daysOfWeek: number[],
  weekday: number,
) =>
  schedule === RoutineSchedule.DAILY ||
  (schedule === RoutineSchedule.WEEKDAYS && weekday >= 1 && weekday <= 5) ||
  (schedule === RoutineSchedule.CUSTOM && daysOfWeek.includes(weekday));
@Injectable()
export class AnalyticsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  async overview(user: AuthenticatedUser, query: AnalyticsRangeQueryDto) {
    const dates = rangeDates(query.from, query.to);
    const from = dates[0];
    const lastDate = dates[dates.length - 1];
    if (!lastDate) throw new BadRequestException("Intervalo inválido.");
    const until = new Date(lastDate);
    until.setUTCDate(until.getUTCDate() + 1);
    const [tasks, routines, entries, timeEntries] = await Promise.all([
      this.prisma.task.findMany({
        where: {
          userId: user.id,
          status: TaskStatus.COMPLETED,
          completedAt: { gte: from, lt: until },
        },
        select: { id: true, area: true, completedAt: true },
      }),
      this.prisma.routine.findMany({
        where: { userId: user.id, isActive: true },
        select: { id: true, schedule: true, daysOfWeek: true },
      }),
      this.prisma.routineEntry.findMany({
        where: {
          userId: user.id,
          completed: true,
          date: { gte: from, lt: until },
          routine: { userId: user.id },
        },
        select: { routineId: true, date: true },
      }),
      this.prisma.timeEntry.findMany({
        where: { userId: user.id, endedAt: { gte: from, lt: until } },
        select: {
          endedAt: true,
          durationMinutes: true,
          area: true,
          task: { select: { area: true } },
        },
      }),
    ]);
    const daily = dates.map((date) => ({
      date: day(date),
      tasksCompleted: 0,
      routinesCompleted: 0,
      routinesPlanned: routines.filter((routine) =>
        scheduled(routine.schedule, routine.daysOfWeek, date.getUTCDay()),
      ).length,
      trackedMinutes: 0,
    }));
    const byDate = new Map(daily.map((item) => [item.date, item]));
    const areas = new Map<
      string,
      { area: string; tasksCompleted: number; trackedMinutes: number }
    >();
    const addArea = (
      area: string | null,
      key: "tasksCompleted" | "trackedMinutes",
      value: number,
    ) => {
      if (!area) return;
      const current = areas.get(area) ?? {
        area,
        tasksCompleted: 0,
        trackedMinutes: 0,
      };
      current[key] += value;
      areas.set(area, current);
    };
    for (const task of tasks) {
      const item = task.completedAt && byDate.get(day(task.completedAt));
      if (item) item.tasksCompleted++;
      addArea(task.area, "tasksCompleted", 1);
    }
    for (const entry of entries) {
      const item = byDate.get(day(entry.date));
      if (item) item.routinesCompleted++;
    }
    for (const entry of timeEntries) {
      const item = entry.endedAt && byDate.get(day(entry.endedAt));
      const minutes = entry.durationMinutes ?? 0;
      if (item) item.trackedMinutes += minutes;
      addArea(
        entry.area ?? entry.task?.area ?? null,
        "trackedMinutes",
        minutes,
      );
    }
    const routinePlanned = daily.reduce(
      (sum, item) => sum + item.routinesPlanned,
      0,
    );
    const routineCompleted = daily.reduce(
      (sum, item) => sum + item.routinesCompleted,
      0,
    );
    const trackedMinutes = daily.reduce(
      (sum, item) => sum + item.trackedMinutes,
      0,
    );
    return {
      range: { from: query.from, to: query.to },
      summary: {
        tasksCompleted: tasks.length,
        routinePlanned,
        routineCompleted,
        routineCompletionRate: routinePlanned
          ? routineCompleted / routinePlanned
          : null,
        trackedMinutes,
        trackedSessions: timeEntries.length,
        averageSessionMinutes: timeEntries.length
          ? Math.round(trackedMinutes / timeEntries.length)
          : 0,
      },
      daily,
      areas: [...areas.values()].sort(
        (a, b) =>
          b.trackedMinutes - a.trackedMinutes ||
          b.tasksCompleted - a.tasksCompleted,
      ),
    };
  }
}
