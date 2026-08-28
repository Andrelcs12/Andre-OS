import { Inject, Injectable } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth.types.js";
import { TaskStatus } from "../generated/prisma/enums.js";
import { PrismaService } from "../prisma/prisma.service.js";
import {
  HistoryEventType,
  type ListHistoryQueryDto,
} from "./dto/list-history-query.dto.js";

export type HistoryEvent = {
  id: string;
  type: HistoryEventType;
  occurredAt: Date;
  title: string;
  description: string | null;
  area: string | null;
  metadata: {
    taskId?: string;
    routineId?: string;
    timeEntryId?: string;
    durationMinutes?: number;
  };
};

@Injectable()
export class HistoryService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(user: AuthenticatedUser, query: ListHistoryQueryDto) {
    const limit = query.limit ?? 50;
    const occurredAt = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {}),
    };
    const sourceLimit = Math.min(100, limit);
    const [tasks, routineEntries, timeEntries] = await Promise.all([
      query.type && query.type !== HistoryEventType.TASK_COMPLETED
        ? []
        : this.prisma.task.findMany({
            where: {
              userId: user.id,
              status: TaskStatus.COMPLETED,
              completedAt: { not: null, ...occurredAt },
            },
            select: {
              id: true,
              title: true,
              description: true,
              area: true,
              completedAt: true,
            },
            orderBy: { completedAt: "desc" },
            take: sourceLimit,
          }),
      query.type && query.type !== HistoryEventType.ROUTINE_COMPLETED
        ? []
        : this.prisma.routineEntry.findMany({
            where: {
              userId: user.id,
              completed: true,
              completedAt: { not: null, ...occurredAt },
              routine: { userId: user.id },
            },
            select: {
              id: true,
              routineId: true,
              completedAt: true,
              routine: {
                select: { title: true, description: true, area: true },
              },
            },
            orderBy: { completedAt: "desc" },
            take: sourceLimit,
          }),
      query.type && query.type !== HistoryEventType.TIME_ENTRY
        ? []
        : this.prisma.timeEntry.findMany({
            where: { userId: user.id, endedAt: { not: null, ...occurredAt } },
            select: {
              id: true,
              taskId: true,
              description: true,
              area: true,
              endedAt: true,
              durationMinutes: true,
              task: { select: { title: true } },
            },
            orderBy: { endedAt: "desc" },
            take: sourceLimit,
          }),
    ]);
    const events: HistoryEvent[] = [
      ...tasks.flatMap((task) => {
        if (!task.completedAt) return [];
        return [
          {
            id: `task:${task.id}`,
            type: HistoryEventType.TASK_COMPLETED,
            occurredAt: task.completedAt,
            title: task.title,
            description: task.description,
            area: task.area,
            metadata: { taskId: task.id },
          },
        ];
      }),
      ...routineEntries.flatMap((entry) => {
        if (!entry.completedAt) return [];
        return [
          {
            id: `routine:${entry.id}`,
            type: HistoryEventType.ROUTINE_COMPLETED,
            occurredAt: entry.completedAt,
            title: entry.routine.title,
            description: entry.routine.description,
            area: entry.routine.area,
            metadata: { routineId: entry.routineId },
          },
        ];
      }),
      ...timeEntries.flatMap((entry) => {
        if (!entry.endedAt) return [];
        return [
          {
            id: `time:${entry.id}`,
            type: HistoryEventType.TIME_ENTRY,
            occurredAt: entry.endedAt,
            title: entry.task?.title || entry.description || "Sessão de tempo",
            description: entry.description,
            area: entry.area,
            metadata: {
              timeEntryId: entry.id,
              ...(entry.taskId ? { taskId: entry.taskId } : {}),
              ...(entry.durationMinutes !== null
                ? { durationMinutes: entry.durationMinutes }
                : {}),
            },
          },
        ];
      }),
    ];
    return events
      .sort(
        (a, b) =>
          b.occurredAt.getTime() - a.occurredAt.getTime() ||
          a.id.localeCompare(b.id),
      )
      .slice(0, limit);
  }
}
