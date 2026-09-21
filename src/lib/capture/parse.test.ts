import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCapture, splitClauses } from "./parse.ts";
import type { Habit } from "../api/types.ts";

const HABITS: Habit[] = [
  { id: "HAB-1", name: "Morning walk", lifeArea: "Health", active: true, targetPerWeek: 5 },
  { id: "HAB-2", name: "Deep work block", lifeArea: "Work", active: true, targetPerWeek: 4 },
];

test("splitClauses handles the canonical capture sentence", () => {
  const clauses = splitClauses(
    "Pay electricity tomorrow, spent $62 on groceries and walked for 30 minutes.",
  );
  assert.deepEqual(clauses, [
    "Pay electricity tomorrow",
    "spent $62 on groceries",
    "walked for 30 minutes",
  ]);
});

test("parseCapture classifies task, expense and habit", () => {
  const proposals = parseCapture(
    "Pay electricity tomorrow, spent $62 on groceries and walked for 30 minutes.",
    HABITS,
  );
  assert.equal(proposals.length, 3);
  assert.equal(proposals[0].kind, "task");
  assert.equal(proposals[0].supported, true);
  assert.equal(proposals[0].data.name, "Pay electricity");
  assert.equal(proposals[1].kind, "transaction");
  assert.equal(proposals[1].data.amount, 62);
  assert.equal(proposals[1].data.type, "Expense");
  assert.match(String(proposals[1].data.category), /Grocer/i);
  assert.equal(proposals[2].kind, "habit");
  assert.equal(proposals[2].data.habitId, "HAB-1");
});

test("unsupported clauses become notes and are not supported", () => {
  const proposals = parseCapture("remember the mycelium metaphor", HABITS);
  assert.equal(proposals[0].kind, "note");
  assert.equal(proposals[0].supported, false);
});

test("earned money is income", () => {
  const proposals = parseCapture("earned $120 from consulting", HABITS);
  assert.equal(proposals[0].kind, "transaction");
  assert.equal(proposals[0].data.type, "Income");
  assert.equal(proposals[0].data.amount, 120);
});
