import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import "dotenv/config";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { AuthService } from "../../dist/auth/auth.service.js";
import { PrismaService } from "../../dist/prisma/prisma.service.js";
import { UsersService } from "../../dist/users/users.service.js";

const port = 3110;
const baseUrl = `http://127.0.0.1:${port}`;
const suffix = `${Date.now()}-${process.pid}`;
const identities = [
  { googleId: `e2e-a-${suffix}`, email: `e2e-a-${suffix}@example.test`, displayName: "E2E User A", avatarUrl: null },
  { googleId: `e2e-b-${suffix}`, email: `e2e-b-${suffix}@example.test`, displayName: "E2E User B", avatarUrl: null },
];

async function request(path, { cookie, method = "GET", body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    redirect: "manual",
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(body ? { "content-type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  return {
    response,
    status: response.status,
    headers: response.headers,
    body: text ? JSON.parse(text) : null,
  };
}

async function expectStatus(path, expected, options) {
  const result = await request(path, options);
  assert.equal(
    result.status,
    expected,
    `${options?.method ?? "GET"} ${path}: ${JSON.stringify(result.body)}`,
  );
  return result;
}

async function waitForApi() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      if ((await request("/health")).status === 200) return;
    } catch {}
    await delay(200);
  }
  throw new Error("A API E2E não iniciou.");
}

function sessionCookie(value) {
  return value.split(";", 1)[0];
}

test("fluxo HTTP autenticado, validação e isolamento por usuário", { timeout: 120_000 }, async () => {
  const config = new ConfigService(process.env);
  const prisma = new PrismaService(config);
  const users = new UsersService(prisma);
  const auth = new AuthService(config, new JwtService(), users);
  const server = spawn(process.execPath, ["dist/main.js"], {
    cwd: new URL("../..", import.meta.url),
    env: { ...process.env, PORT: String(port), NODE_ENV: "test" },
    stdio: "ignore",
  });

  try {
    await prisma.onModuleInit();
    await waitForApi();

    const headers = [];
    const reply = { header: (name, value) => headers.push([name, value]) };
    await auth.completeGoogleSignIn(reply, identities[0]);
    await auth.completeGoogleSignIn(reply, identities[1]);
    const cookieA = sessionCookie(headers[0][1]);
    const cookieB = sessionCookie(headers[1][1]);
    const userA = await users.upsertGoogleUser(identities[0]);
    const userB = await users.upsertGoogleUser(identities[1]);

    for (const path of ["/tasks", "/routines", "/links", "/time-entries", "/history", "/analytics/overview?from=2026-08-01&to=2026-08-01", "/north"]) {
      await expectStatus(path, 401);
    }
    assert.equal((await request("/health")).status, 200);
    assert.equal((await request("/auth/me")).status, 401);
    assert.equal((await request("/auth/me", { cookie: "andre_os_session=invalid" })).status, 401);
    assert.equal((await request("/auth/me", { cookie: cookieA })).body.id, userA.id);

    const google = await request("/auth/google");
    assert.equal(google.status, 302);
    const authorization = new URL(google.headers.get("location"));
    assert.equal(authorization.hostname, "accounts.google.com");
    assert.equal(authorization.pathname, "/o/oauth2/v2/auth");
    for (const scope of ["openid", "email", "profile"])
      assert.match(authorization.searchParams.get("scope") ?? "", new RegExp(`\\b${scope}\\b`));
    assert.equal(authorization.searchParams.get("redirect_uri"), process.env.GOOGLE_CALLBACK_URL);

    await expectStatus("/tasks", 400, { method: "POST", cookie: cookieA, body: { title: "x", area: "ENGINEERING", userId: userB.id } });
    await expectStatus("/tasks", 400, { method: "POST", cookie: cookieA, body: { title: "x", area: "WRONG" } });
    await expectStatus("/tasks", 400, { method: "POST", cookie: cookieA, body: { area: "ENGINEERING" } });
    const task = await expectStatus("/tasks", 201, { method: "POST", cookie: cookieA, body: { title: " Task A ", area: "ENGINEERING", estimatedMinutes: 30 } });
    assert.equal(task.body.title, "Task A");
    assert.equal(task.body.estimatedMinutes, 30);
    await expectStatus(`/tasks/${task.body.id}`, 404, { cookie: cookieB });
    await expectStatus(`/tasks/${task.body.id}`, 200, { method: "PATCH", cookie: cookieA, body: { title: "Task editada" } });
    await expectStatus(`/tasks/${task.body.id}`, 200, { method: "PATCH", cookie: cookieA, body: { status: "COMPLETED" } });
    await expectStatus(`/tasks/${task.body.id}`, 200, { method: "PATCH", cookie: cookieA, body: { status: "PENDING" } });

    const routine = await expectStatus("/routines", 201, { method: "POST", cookie: cookieA, body: { title: "Rotina A", schedule: "CUSTOM", daysOfWeek: [1, 3] } });
    await expectStatus(`/routines/${routine.body.id}`, 404, { cookie: cookieB });
    const routineDate = "2026-08-24";
    await expectStatus(`/routines/${routine.body.id}/entries/${routineDate}`, 200, { method: "PUT", cookie: cookieA, body: { completed: true } });
    await expectStatus(`/routines/${routine.body.id}/entries/${routineDate}`, 200, { method: "PUT", cookie: cookieA, body: { completed: false } });
    await expectStatus(`/routines/${routine.body.id}`, 200, { method: "PATCH", cookie: cookieA, body: { isActive: false } });
    await expectStatus(`/routines/${routine.body.id}`, 200, { method: "PATCH", cookie: cookieA, body: { isActive: true } });
    await expectStatus(`/routines/${routine.body.id}/entries/${routineDate}`, 200, { method: "PUT", cookie: cookieA, body: { completed: true } });

    await expectStatus("/links", 400, { method: "POST", cookie: cookieA, body: { title: "ruim", url: "javascript:alert(1)" } });
    const link = await expectStatus("/links", 201, { method: "POST", cookie: cookieA, body: { title: "Link A", url: "https://example.com/a", area: "PRODUCT" } });
    assert.deepEqual(
      (await expectStatus("/links?search=Link&favorite=true", 200, {
        cookie: cookieA,
      })).body,
      [],
    );
    await expectStatus(`/links/${link.body.id}`, 200, { method: "PATCH", cookie: cookieA, body: { isFavorite: true, title: "Link editado" } });
    assert.equal((await expectStatus("/links?search=editado&favorite=true", 200, { cookie: cookieA })).body[0].id, link.body.id);
    await expectStatus(`/links/${link.body.id}`, 404, { cookie: cookieB });

    const track = await expectStatus("/north/tracks", 201, { method: "POST", cookie: cookieA, body: { title: "Norte A", area: "ENGINEERING" } });
    const item = await expectStatus(`/north/tracks/${track.body.id}/items`, 201, { method: "POST", cookie: cookieA, body: { title: "Item A", plannedMinutes: "25" } });
    await expectStatus(`/north/items/${item.body.id}`, 200, { method: "PATCH", cookie: cookieA, body: { status: "IN_PROGRESS" } });
    assert.equal((await expectStatus("/north", 200, { cookie: cookieA })).body.currentItem.id, item.body.id);
    await expectStatus(`/north/items/${item.body.id}`, 404, { method: "PATCH", cookie: cookieB, body: { status: "COMPLETED" } });

    await expectStatus("/time-entries/start", 404, { method: "POST", cookie: cookieB, body: { taskId: task.body.id } });
    await expectStatus("/time-entries/start", 404, { method: "POST", cookie: cookieB, body: { northItemId: item.body.id } });
    const active = await expectStatus("/time-entries/start", 201, { method: "POST", cookie: cookieA, body: { northItemId: item.body.id, description: "Foco" } });
    assert.equal((await expectStatus("/time-entries/active", 200, { cookie: cookieA })).body.id, active.body.id);
    await expectStatus("/time-entries/start", 409, { method: "POST", cookie: cookieA, body: { taskId: task.body.id } });
    await expectStatus(`/time-entries/${active.body.id}/stop`, 404, { method: "POST", cookie: cookieB });
    await expectStatus(`/time-entries/${active.body.id}/stop`, 201, { method: "POST", cookie: cookieA });
    await expectStatus(`/north/items/${item.body.id}`, 200, { method: "PATCH", cookie: cookieA, body: { status: "COMPLETED" } });
    const north = await expectStatus("/north", 200, { cookie: cookieA });
    assert.ok(north.body.items[0].trackedMinutes >= 1);
    await expectStatus(`/north/items/${item.body.id}`, 200, { method: "PATCH", cookie: cookieA, body: { status: "TODO" } });

    await expectStatus(`/tasks/${task.body.id}`, 200, { method: "PATCH", cookie: cookieA, body: { status: "COMPLETED" } });
    const history = await expectStatus("/history?limit=10", 200, { cookie: cookieA });
    assert.deepEqual(new Set(history.body.map((event) => event.type)), new Set(["TASK_COMPLETED", "ROUTINE_COMPLETED", "TIME_ENTRY"]));
    const today = new Date().toISOString().slice(0, 10);
    const analytics = await expectStatus(`/analytics/overview?from=${today}&to=${today}`, 200, { cookie: cookieA });
    assert.ok(analytics.body.summary.tasksCompleted >= 1);
    assert.ok(analytics.body.summary.trackedMinutes >= 1);
    assert.equal(typeof analytics.body.comparison.delta.tasksCompleted, "number");

    assert.deepEqual((await expectStatus("/history", 200, { cookie: cookieB })).body, []);
    assert.equal((await expectStatus(`/analytics/overview?from=${today}&to=${today}`, 200, { cookie: cookieB })).body.summary.tasksCompleted, 0);
    assert.equal((await expectStatus("/north", 200, { cookie: cookieB })).body.track, null);
    await expectStatus(`/links/${link.body.id}`, 200, { method: "DELETE", cookie: cookieA });
    await expectStatus(`/tasks/${task.body.id}`, 200, { method: "DELETE", cookie: cookieA });

    const logout = await expectStatus("/auth/logout", 204, { method: "POST", cookie: cookieA });
    assert.match(logout.headers.get("set-cookie") ?? "", /HttpOnly.*SameSite=Lax.*Max-Age=0/);
    await expectStatus("/tasks", 401);
  } finally {
    for (const identity of identities) {
      const user = await prisma.user.findUnique({ where: { googleId: identity.googleId } });
      if (user) await prisma.user.delete({ where: { id: user.id } });
    }
    await prisma.onModuleDestroy();
    server.kill();
  }
});
