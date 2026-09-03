import assert from "node:assert/strict";
import test from "node:test";
import { ServiceUnavailableException } from "@nestjs/common";

import { SessionAuthGuard } from "../../dist/auth/guards/session-auth.guard.js";

function context(headers) {
  const request = { headers };
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    request,
  };
}

test("a autenticação rejeita token ausente ou inválido", async () => {
  const auth = { getIdentity: async () => null };
  const users = { upsertSupabaseUser: async () => undefined };
  const guard = new SessionAuthGuard(auth, users);

  await assert.rejects(() => guard.canActivate(context({})));
  await assert.rejects(() =>
    guard.canActivate(context({ authorization: "Bearer invalid-token" })),
  );
});

test("a autenticação injeta somente a identidade confirmada pelo Supabase", async () => {
  const auth = {
    getIdentity: async () => ({
      authUserId: "a3c4d2a3-0ed8-4105-8c1e-79f6be517a70",
      email: "andre@example.test",
      displayName: "André",
      avatarUrl: null,
    }),
  };
  const users = {
    upsertSupabaseUser: async () => ({
      id: "d12e729c-5095-4d92-aa91-d29e35d0982f",
      email: "andre@example.test",
    }),
  };
  const guard = new SessionAuthGuard(auth, users);
  const executionContext = context({ authorization: "Bearer verified-token" });

  assert.equal(await guard.canActivate(executionContext), true);
  assert.deepEqual(executionContext.request.user, {
    id: "d12e729c-5095-4d92-aa91-d29e35d0982f",
    email: "andre@example.test",
  });
});

test("uma API sem configuração Supabase informa indisponibilidade", async () => {
  const unavailable = new ServiceUnavailableException("Supabase Auth ausente");
  const auth = { getIdentity: async () => Promise.reject(unavailable) };
  const users = { upsertSupabaseUser: async () => undefined };
  const guard = new SessionAuthGuard(auth, users);

  await assert.rejects(
    () => guard.canActivate(context({ authorization: "Bearer token" })),
    (error) => error === unavailable,
  );
});
