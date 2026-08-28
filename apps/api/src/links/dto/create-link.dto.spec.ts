import assert from "node:assert/strict";
import test from "node:test";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateLinkDto } from "./create-link.dto.js";

test("aceita URLs HTTP e HTTPS e rejeita esquemas inseguros ou inválidos", async () => {
  for (const url of ["http://example.com", "https://example.com"]) {
    assert.equal(
      (await validate(plainToInstance(CreateLinkDto, { title: "Link", url })))
        .length,
      0,
    );
  }
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,test",
    "not-a-url",
  ]) {
    assert.ok(
      (await validate(plainToInstance(CreateLinkDto, { title: "Link", url })))
        .length > 0,
    );
  }
});
