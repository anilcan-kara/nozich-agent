import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

describe("nozich-agent workspace health", function verifyWorkspaceHealth() {
  test("root package.json and shared workspace exist", function checkManifests() {
    expect(existsSync(join(import.meta.dir, "../package.json"))).toBe(true);
    expect(existsSync(join(import.meta.dir, "../apps/shared/package.json"))).toBe(true);
  });
});
