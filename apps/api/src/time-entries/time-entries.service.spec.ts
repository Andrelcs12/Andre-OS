import assert from "node:assert/strict";
import test from "node:test";
import { ConflictException, NotFoundException } from "@nestjs/common";
import type { PrismaService } from "../prisma/prisma.service.js";
import {
  calculateDurationMinutes,
  TimeEntriesService,
} from "./time-entries.service.js";

const user = { id: "user-a", email: "andre@example.com" };
test("arredonda duração no backend uma única vez", () => {
  assert.equal(
    calculateDurationMinutes(
      new Date("2026-01-01T10:00:00Z"),
      new Date("2026-01-01T10:01:01Z"),
    ),
    2,
  );
  assert.equal(
    calculateDurationMinutes(
      new Date("2026-01-01T10:00:00Z"),
      new Date("2026-01-01T10:00:00Z"),
    ),
    1,
  );
});
test("start usa owner e horário do servidor", async () => {
  const calls: unknown[] = [];
  const prisma = {
    task: { findFirst: async () => null },
    timeEntry: {
      findFirst: async () => null,
      create: async (value: unknown) => {
        calls.push(value);
        return value;
      },
    },
  } as unknown as PrismaService;
  const service = new TimeEntriesService(prisma);
  await service.start(user, { description: "Foco" });
  const data = (
    calls[0] as {
      data: { userId: string; startedAt: Date; description: string };
    }
  ).data;
  assert.equal(data.userId, user.id);
  assert.ok(data.startedAt instanceof Date);
  assert.equal(data.description, "Foco");
});
test("segunda sessão ativa é rejeitada e active filtra owner", async () => {
  const calls: unknown[] = [];
  const prisma = {
    timeEntry: {
      findFirst: async (value: unknown) => {
        calls.push(value);
        return { id: "active" };
      },
    },
  } as unknown as PrismaService;
  const service = new TimeEntriesService(prisma);
  await assert.rejects(() => service.start(user, {}), ConflictException);
  await service.active(user);
  assert.deepEqual(calls[1], {
    where: { userId: user.id, endedAt: null },
    include: {
      task: { select: { id: true, title: true } },
      northItem: { select: { id: true, title: true } },
    },
    orderBy: { startedAt: "desc" },
  });
});
test("task de outro owner e stop de outro owner retornam 404", async () => {
  const prisma = {
    task: { findFirst: async () => null },
    timeEntry: { findFirst: async () => null },
  } as unknown as PrismaService;
  const service = new TimeEntriesService(prisma);
  await assert.rejects(
    () =>
      service.start(user, { taskId: "00000000-0000-4000-8000-000000000001" }),
    NotFoundException,
  );
  await assert.rejects(() => service.stop(user, "other"), NotFoundException);
});
test("lista somente owner por recência", async () => {
  const calls: unknown[] = [];
  const prisma = {
    timeEntry: {
      findMany: async (value: unknown) => {
        calls.push(value);
        return [];
      },
    },
  } as unknown as PrismaService;
  const service = new TimeEntriesService(prisma);
  await service.list(user, {});
  assert.deepEqual(calls[0], {
    where: { userId: user.id },
    include: {
      task: { select: { id: true, title: true } },
      northItem: { select: { id: true, title: true } },
    },
    orderBy: { startedAt: "desc" },
    take: 20,
  });
});
