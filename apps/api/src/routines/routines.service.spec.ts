import assert from "node:assert/strict";
import test from "node:test";

import { RoutineSchedule } from "../generated/prisma/enums.js";
import type { PrismaService } from "../prisma/prisma.service.js";
import { RoutinesService } from "./routines.service.js";

const user = { id: "user-a", email: "a@example.com" };
const otherUser = { id: "user-b", email: "b@example.com" };

function subject() {
  const calls: Record<string, unknown[]> = {
    create: [],
    delete: [],
    findFirst: [],
    findMany: [],
    update: [],
    upsert: [],
  };
  const routine = {
    id: "routine-a",
    userId: user.id,
    title: "Rotina",
    schedule: RoutineSchedule.DAILY,
    daysOfWeek: [],
    isActive: true,
  };
  const prisma = {
    routine: {
      create: async (value: unknown) => {
        calls.create.push(value);
        return routine;
      },
      delete: async (value: unknown) => {
        calls.delete.push(value);
      },
      findFirst: async (value: unknown) => {
        calls.findFirst.push(value);
        return routine;
      },
      findMany: async (value: unknown) => {
        calls.findMany.push(value);
        return [routine];
      },
      update: async (value: unknown) => {
        calls.update.push(value);
        return routine;
      },
    },
    routineEntry: {
      upsert: async (value: unknown) => {
        calls.upsert.push(value);
        return value;
      },
    },
  } as unknown as PrismaService;
  return { calls, service: new RoutinesService(prisma) };
}

test("cria para o owner e normaliza dias DAILY, WEEKDAYS e CUSTOM", async () => {
  const { calls, service } = subject();
  await service.create(user, {
    title: " diária ",
    schedule: RoutineSchedule.DAILY,
  });
  await service.create(user, {
    title: "semana",
    schedule: RoutineSchedule.WEEKDAYS,
    daysOfWeek: [1, 2],
  });
  await service.create(user, {
    title: "custom",
    schedule: RoutineSchedule.CUSTOM,
    daysOfWeek: [3, 1, 3],
  });

  assert.deepEqual(
    calls.create.map((value) => (value as { data: unknown }).data),
    [
      expectData({
        title: "diária",
        schedule: RoutineSchedule.DAILY,
        daysOfWeek: [],
      }),
      expectData({
        title: "semana",
        schedule: RoutineSchedule.WEEKDAYS,
        daysOfWeek: [],
      }),
      expectData({
        title: "custom",
        schedule: RoutineSchedule.CUSTOM,
        daysOfWeek: [1, 3],
      }),
    ],
  );
  assert.throws(() =>
    service.create(user, {
      title: "inválida",
      schedule: RoutineSchedule.CUSTOM,
    }),
  );
});

function expectData(value: Record<string, unknown>) {
  return { userId: user.id, description: null, area: undefined, ...value };
}

test("filtra owner, pausa, conclui, reabre e remove somente a rotina do owner", async () => {
  const { calls, service } = subject();
  await service.list(user, { active: "false" });
  await service.update(user, "routine-a", { isActive: false });
  await service.setEntry(user, "routine-a", "2026-08-28", { completed: true });
  await service.setEntry(user, "routine-a", "2026-08-28", { completed: true });
  await service.setEntry(user, "routine-a", "2026-08-28", { completed: false });
  await service.remove(user, "routine-a");

  assert.deepEqual(calls.findMany[0], {
    where: { userId: user.id, isActive: false },
    orderBy: { createdAt: "desc" },
  });
  assert.deepEqual(calls.update[0], {
    where: { id: "routine-a" },
    data: { isActive: false },
  });
  assert.equal(calls.upsert.length, 3);
  for (const value of calls.upsert) {
    assert.deepEqual((value as { where: unknown }).where, {
      routineId_date: {
        routineId: "routine-a",
        date: new Date("2026-08-28T00:00:00.000Z"),
      },
    });
  }
  assert.equal(
    (calls.upsert[0] as { create: { completedAt: unknown } }).create
      .completedAt instanceof Date,
    true,
  );
  assert.equal(
    (calls.upsert[2] as { update: { completedAt: unknown } }).update
      .completedAt,
    null,
  );
  assert.deepEqual(calls.delete[0], { where: { id: "routine-a" } });

  await service.findOne(otherUser, "routine-a");
  assert.deepEqual(calls.findFirst.at(-1), {
    where: { id: "routine-a", userId: otherUser.id },
  });
});
