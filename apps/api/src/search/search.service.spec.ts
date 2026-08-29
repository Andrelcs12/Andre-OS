import assert from "node:assert/strict";
import test from "node:test";
import type { PrismaService } from "../prisma/prisma.service.js";
import { SearchService } from "./search.service.js";

const user = { id: "user-a", email: "andre@example.com" };

test("busca todas as entidades apenas dentro do ownership do usuário", async () => {
  let queries: unknown[] = [];
  const prisma = {
    $transaction: async (value: unknown[]) => {
      queries = value;
      return [
        [{ id: "task", title: "Plano", description: null }],
        [{ id: "routine", title: "Leitura", description: null }],
        [{ id: "link", title: "Docs", description: null, url: "https://docs" }],
        [{ id: "track", title: "Norte", description: null }],
        [
          {
            id: "item",
            title: "Estudar",
            description: null,
            track: { title: "Norte" },
          },
        ],
      ];
    },
    task: { findMany: (value: unknown) => value },
    routine: { findMany: (value: unknown) => value },
    link: { findMany: (value: unknown) => value },
    northTrack: { findMany: (value: unknown) => value },
    northItem: { findMany: (value: unknown) => value },
  } as unknown as PrismaService;

  const result = await new SearchService(prisma).search(user, " plano ");

  assert.equal(queries.length, 5);
  assert.deepEqual(queries[0], {
    where: {
      userId: user.id,
      OR: [
        { title: { contains: "plano", mode: "insensitive" } },
        { description: { contains: "plano", mode: "insensitive" } },
      ],
    },
    select: { id: true, title: true, description: true },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });
  assert.deepEqual(queries[4], {
    where: {
      track: { userId: user.id },
      OR: [
        { title: { contains: "plano", mode: "insensitive" } },
        { description: { contains: "plano", mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      track: { select: { title: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });
  assert.deepEqual(result, [
    { id: "task", title: "Plano", description: null, type: "TASK" },
    { id: "routine", title: "Leitura", description: null, type: "ROUTINE" },
    { id: "link", title: "Docs", description: "https://docs", type: "LINK" },
    { id: "track", title: "Norte", description: null, type: "NORTH_TRACK" },
    { id: "item", title: "Estudar", description: "Norte", type: "NORTH_ITEM" },
  ]);
});
