import assert from "node:assert/strict";
import test from "node:test";

import { NotFoundException } from "@nestjs/common";

import type { PrismaService } from "../prisma/prisma.service.js";
import { TasksService } from "./tasks.service.js";

const user = { id: "user-a", email: "andre@example.com" };

function createSubject() {
  const calls: Record<string, unknown[]> = {
    create: [],
    findMany: [],
    findFirst: [],
    update: [],
    delete: [],
  };
  const task = {
    create: async (args: unknown) => {
      calls.create.push(args);
      return args;
    },
    findMany: async (args: unknown) => {
      calls.findMany.push(args);
      return [];
    },
    findFirst: async (args: unknown) => {
      calls.findFirst.push(args);
      return null;
    },
    update: async (args: unknown) => {
      calls.update.push(args);
      return args;
    },
    delete: async (args: unknown) => {
      calls.delete.push(args);
      return args;
    },
  } as Record<string, (args: unknown) => Promise<unknown>>;
  const prisma = { task } as unknown as PrismaService;
  return { calls, task, service: new TasksService(prisma) };
}

test("cria a task para o usuário autenticado, sem owner do payload", async () => {
  const { calls, service } = createSubject();
  await service.create(user, {
    title: "  Implementar Tasks  ",
    area: "ENGINEERING",
  });
  assert.deepEqual(calls.create[0], {
    data: {
      userId: user.id,
      title: "Implementar Tasks",
      description: null,
      area: "ENGINEERING",
      priority: undefined,
      estimatedMinutes: undefined,
      dueDate: undefined,
    },
  });
});

test("lista somente as tasks do usuário autenticado", async () => {
  const { calls, service } = createSubject();
  await service.list(user, { status: "PENDING", search: "api" });
  assert.deepEqual(calls.findMany[0], {
    where: {
      userId: user.id,
      status: "PENDING",
      OR: [
        { title: { contains: "api", mode: "insensitive" } },
        { description: { contains: "api", mode: "insensitive" } },
      ],
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });
});

test("não expõe task pertencente a outro usuário", async () => {
  const { calls, service } = createSubject();
  await assert.rejects(
    () => service.findOne(user, "other-task"),
    NotFoundException,
  );
  assert.deepEqual(calls.findFirst[0], {
    where: { id: "other-task", userId: user.id },
  });
});

test("conclusão define completedAt no service", async () => {
  const { calls, task, service } = createSubject();
  task.findFirst = async () => ({ id: "task-1" });
  await service.update(user, "task-1", { status: "COMPLETED" });
  const update = calls.update[0] as {
    data: { completedAt: Date; status: string };
  };
  assert.equal(update.data.status, "COMPLETED");
  assert.ok(update.data.completedAt instanceof Date);
});

test("reabrir limpa completedAt no service", async () => {
  const { calls, task, service } = createSubject();
  task.findFirst = async () => ({ id: "task-1" });
  await service.update(user, "task-1", { status: "PENDING" });
  assert.deepEqual(calls.update[0], {
    where: { id: "task-1" },
    data: { status: "PENDING", completedAt: null },
  });
});

test("delete respeita ownership", async () => {
  const { calls, service } = createSubject();
  await assert.rejects(
    () => service.remove(user, "other-task"),
    NotFoundException,
  );
  assert.equal(calls.delete.length, 0);
});
