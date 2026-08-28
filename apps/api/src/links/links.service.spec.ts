import assert from "node:assert/strict";
import test from "node:test";
import { NotFoundException } from "@nestjs/common";
import type { PrismaService } from "../prisma/prisma.service.js";
import { LinksService } from "./links.service.js";

const user = { id: "user-a", email: "andre@example.com" };
function subject() {
  const calls: Record<string, unknown[]> = {
    create: [],
    findMany: [],
    findFirst: [],
    update: [],
    delete: [],
  };
  const link = Object.fromEntries(
    Object.keys(calls).map((key) => [
      key,
      async (value: unknown) => {
        calls[key].push(value);
        return key === "findFirst" ? null : value;
      },
    ]),
  );
  return {
    calls,
    link,
    service: new LinksService({ link } as unknown as PrismaService),
  };
}
test("cria link para o owner autenticado", async () => {
  const { calls, service } = subject();
  await service.create(user, { title: " Docs ", url: "https://example.com" });
  assert.deepEqual(calls.create[0], {
    data: {
      userId: "user-a",
      title: "Docs",
      url: "https://example.com",
      description: null,
      area: undefined,
      isFavorite: false,
    },
  });
});
test("lista somente links do owner, busca e favorito", async () => {
  const { calls, service } = subject();
  await service.list(user, { search: "docs", favorite: true });
  assert.deepEqual(calls.findMany[0], {
    where: {
      userId: "user-a",
      isFavorite: true,
      OR: [
        { title: { contains: "docs", mode: "insensitive" } },
        { url: { contains: "docs", mode: "insensitive" } },
        { description: { contains: "docs", mode: "insensitive" } },
      ],
    },
    orderBy: [{ isFavorite: "desc" }, { createdAt: "desc" }],
  });
});
test("não acessa nem remove link de outro owner", async () => {
  const { calls, service } = subject();
  await assert.rejects(() => service.findOne(user, "other"), NotFoundException);
  await assert.rejects(() => service.remove(user, "other"), NotFoundException);
  assert.equal(calls.delete.length, 0);
});
