import assert from "node:assert/strict";
import test from "node:test";
import { NotFoundException } from "@nestjs/common";
import type { PrismaService } from "../prisma/prisma.service.js";
import { NorthService } from "./north.service.js";

const user = { id: "user-a", email: "andre@example.com" };
test("item exige track do owner e começa como TODO", async () => {
  const calls: unknown[] = [];
  const prisma = {
    northTrack: { findFirst: async () => ({ id: "track" }) },
    northItem: {
      count: async () => 2,
      create: async (value: unknown) => {
        calls.push(value);
        return value;
      },
    },
  } as unknown as PrismaService;
  const service = new NorthService(prisma);
  await service.createItem(user, "track", { title: "Ler" });
  assert.deepEqual(calls[0], {
    data: {
      trackId: "track",
      title: "Ler",
      description: null,
      plannedMinutes: undefined,
      scheduledDate: undefined,
      position: 3,
    },
  });
});
test("item de outro owner retorna 404", async () => {
  const prisma = {
    northItem: { findFirst: async () => null },
  } as unknown as PrismaService;
  await assert.rejects(
    () => new NorthService(prisma).findItem(user, "other"),
    NotFoundException,
  );
});
test("overview mantém sequência e seleciona item em execução", async () => {
  const prisma = {
    northTrack: { findFirst: async () => ({ id: "track", title: "Norte" }) },
    northItem: {
      findMany: async () => [
        { id: "todo", status: "TODO", timeEntries: [] },
        { id: "active", status: "IN_PROGRESS", timeEntries: [] },
      ],
    },
  } as unknown as PrismaService;
  const result = await new NorthService(prisma).overview(user);
  assert.equal(result.currentItem?.id, "active");
});
