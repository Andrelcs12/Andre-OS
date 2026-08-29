import assert from "node:assert/strict";
import test from "node:test";
import type { PrismaService } from "../prisma/prisma.service.js";
import { AnalyticsService } from "./analytics.service.js";

const user = { id: "user-a", email: "andre@example.com" };
function subject() {
  const calls: Record<string, unknown[]> = {
    task: [],
    routine: [],
    routineEntry: [],
    timeEntry: [],
  };
  const prisma = {
    task: {
      findMany: async (v: unknown) => {
        calls.task.push(v);
        return [
          {
            id: "t",
            area: "ENGINEERING",
            completedAt: new Date("2026-08-25T12:00:00Z"),
          },
        ];
      },
    },
    routine: {
      findMany: async (v: unknown) => {
        calls.routine.push(v);
        return [
          { id: "daily", schedule: "DAILY", daysOfWeek: [] },
          { id: "weekdays", schedule: "WEEKDAYS", daysOfWeek: [] },
          { id: "custom", schedule: "CUSTOM", daysOfWeek: [1] },
        ];
      },
    },
    routineEntry: {
      findMany: async (v: unknown) => {
        calls.routineEntry.push(v);
        return [{ routineId: "daily", date: new Date("2026-08-25T00:00:00Z") }];
      },
    },
    timeEntry: {
      findMany: async (v: unknown) => {
        calls.timeEntry.push(v);
        return [
          {
            endedAt: new Date("2026-08-25T13:00:00Z"),
            durationMinutes: 120,
            area: null,
            task: { area: "ENGINEERING" },
          },
        ];
      },
    },
  } as unknown as PrismaService;
  return { calls, service: new AnalyticsService(prisma) };
}
test("agrega apenas consultas do owner, agendas, tempo e fallback de área", async () => {
  const { calls, service } = subject();
  const result = await service.overview(user, {
    from: "2026-08-24",
    to: "2026-08-28",
  });
  assert.equal(result.summary.tasksCompleted, 1);
  assert.equal(result.summary.routineCompleted, 1);
  assert.equal(result.summary.trackedMinutes, 120);
  assert.equal(result.summary.averageSessionMinutes, 120);
  assert.equal(result.areas[0]?.area, "ENGINEERING");
  assert.equal(result.areas[0]?.trackedMinutes, 120);
  assert.equal(result.daily[0]?.routinesPlanned, 3);
  assert.equal(result.daily[1]?.routinesPlanned, 2);
  assert.equal(result.daily.length, 5);
  assert.deepEqual(calls.task[0], {
    where: {
      userId: user.id,
      status: "COMPLETED",
      completedAt: {
        gte: new Date("2026-08-24T00:00:00.000Z"),
        lt: new Date("2026-08-29T00:00:00.000Z"),
      },
    },
    select: { id: true, area: true, completedAt: true },
  });
});
test("rejeita intervalos invertidos e acima de 31 dias", async () => {
  const { service } = subject();
  await assert.rejects(() =>
    service.overview(user, { from: "2026-08-31", to: "2026-08-01" }),
  );
  await assert.rejects(() =>
    service.overview(user, { from: "2026-01-01", to: "2026-02-02" }),
  );
});
