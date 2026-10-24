import test from "node:test";
import assert from "node:assert/strict";
import { mayAccessUnit, type InternalProfile, type UnitAssignment } from "./roles.ts";

const assignments: UnitAssignment[] = [
  { unit_id: 10, consultant_user_id: "consultor-a", assigned_at: "2026-10-01", ended_at: null },
  { unit_id: 20, consultant_user_id: "consultor-a", assigned_at: "2026-09-01", ended_at: "2026-09-30" },
  { unit_id: 30, consultant_user_id: "consultor-b", assigned_at: "2026-10-01", ended_at: null },
];
const profile = (role: InternalProfile["role"], active = true): InternalProfile =>
  ({ user_id: "consultor-a", role, active });

test("anonymous and inactive users cannot access units", () => {
  assert.equal(mayAccessUnit(null, 10, assignments), false);
  assert.equal(mayAccessUnit(profile("consultor", false), 10, assignments), false);
});

test("consultant sees only own active assignments", () => {
  assert.equal(mayAccessUnit(profile("consultor"), 10, assignments), true);
  assert.equal(mayAccessUnit(profile("consultor"), 20, assignments), false);
  assert.equal(mayAccessUnit(profile("consultor"), 30, assignments), false);
});

test("national supervision and management see all units", () => {
  assert.equal(mayAccessUnit(profile("supervisao_nacional"), 30, assignments), true);
  assert.equal(mayAccessUnit(profile("diretoria"), 30, assignments), true);
});
