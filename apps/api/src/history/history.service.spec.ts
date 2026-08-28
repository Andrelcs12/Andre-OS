import assert from "node:assert/strict";
import test from "node:test";
import "reflect-metadata";
import type { PrismaService } from "../prisma/prisma.service.js";
import { HistoryEventType } from "./dto/list-history-query.dto.js";
import { HistoryService } from "./history.service.js";

const user = { id: "user-a", email: "andre@example.com" };
function subject() {
  const calls: Record<string, unknown[]> = {
    task: [],
    routineEntry: [],
    timeEntry: [],
  };
  const prisma = {
    task: {
      findMany: async (args: unknown) => {
        calls.task.push(args);
        return [
          {
            id: "task-1",
            title: "Tarefa",
            description: null,
            area: "ENGINEERING",
            completedAt: new Date("2026-08-28T12:00:00Z"),
          },
        ];
      },
    },
    routineEntry: {
      findMany: async (args: unknown) => {
        calls.routineEntry.push(args);
        return [
          {
            id: "routine-entry-1",
            routineId: "routine-1",
            completedAt: new Date("2026-08-28T11:00:00Z"),
            routine: { title: "Rotina", description: null, area: "PERSONAL" },
          },
        ];
      },
    },
    timeEntry: {
      findMany: async (args: unknown) => {
        calls.timeEntry.push(args);
        return [
          {
            id: "entry-1",
            taskId: null,
            description: "Foco",
            area: "PRODUCT",
            endedAt: new Date("2026-08-28T13:00:00Z"),
            durationMinutes: 48,
            task: null,
          },
        ];
      },
    },
  } as unknown as PrismaService;
  return { calls, service: new HistoryService(prisma) };
}
test("normaliza fontes do owner, preserva duração, ordena e limita", async () => {
  const { calls, service } = subject();
  const events = await service.list(user, { limit: 2 });
  assert.deepEqual(
    events.map((event) => event.type),
    [HistoryEventType.TIME_ENTRY, HistoryEventType.TASK_COMPLETED],
  );
  assert.equal(events[0].metadata.durationMinutes, 48);
  assert.deepEqual(calls.task[0], {
    where: { userId: user.id, status: "COMPLETED", completedAt: { not: null } },
    select: {
      id: true,
      title: true,
      description: true,
      area: true,
      completedAt: true,
    },
    orderBy: { completedAt: "desc" },
    take: 2,
  });
  assert.deepEqual(calls.routineEntry[0], {
    where: {
      userId: user.id,
      completed: true,
      completedAt: { not: null },
      routine: { userId: user.id },
    },
    select: {
      id: true,
      routineId: true,
      completedAt: true,
      routine: { select: { title: true, description: true, area: true } },
    },
    orderBy: { completedAt: "desc" },
    take: 2,
  });
  assert.deepEqual(calls.timeEntry[0], {
    where: { userId: user.id, endedAt: { not: null } },
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
    take: 2,
  });
});
test("filtro por tipo consulta somente a fonte solicitada", async () => {
  const { calls, service } = subject();
  const events = await service.list(user, {
    type: HistoryEventType.TIME_ENTRY,
  });
  assert.equal(events.length, 1);
  assert.equal(events[0].type, HistoryEventType.TIME_ENTRY);
  assert.equal(calls.task.length, 0);
  assert.equal(calls.routineEntry.length, 0);
  assert.equal(calls.timeEntry.length, 1);
});
