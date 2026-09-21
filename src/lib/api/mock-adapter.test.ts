import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { createMockAdapter } from "./mock-adapter.ts";

function installStorage() {
  const map = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(i) {
      return [...map.keys()][i] ?? null;
    },
    removeItem(key) {
      map.delete(key);
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
  };
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
}

beforeEach(() => {
  installStorage();
});

afterEach(() => {
  localStorage.clear();
});

test("createTask rejects a blank name", async () => {
  const api = createMockAdapter();
  await assert.rejects(() => api.createTask({ name: "  " }), /required/i);
});

test("createTask and complete a task", async () => {
  const api = createMockAdapter();
  const task = await api.createTask({ name: "Call the plumber", priority: "High" });
  assert.equal(task.name, "Call the plumber");
  const done = await api.updateTask(task.id, { status: "Completed" });
  assert.equal(done.status, "Completed");
  assert.ok(done.completed);
});

test("createGoal computes progress and updateGoal edits name", async () => {
  const api = createMockAdapter();
  const goal = await api.createGoal({ name: "Ship LifeOS", currentValue: 20, targetValue: 100 });
  assert.equal(goal.progress, 20);
  const next = await api.updateGoal(goal.id, { name: "Ship LifeOS V1", currentValue: 50 });
  assert.equal(next.name, "Ship LifeOS V1");
  assert.equal(next.progress, 50);
});

test("createGoal rejects empty name", async () => {
  const api = createMockAdapter();
  await assert.rejects(() => api.createGoal({ name: "" }), /required/i);
});

test("createTransaction validates amount", async () => {
  const api = createMockAdapter();
  await assert.rejects(() => api.createTransaction({ description: "x", amount: 0, type: "Expense" }), /greater/i);
  const tx = await api.createTransaction({ description: "Coffee", amount: 4.5, type: "Expense" });
  assert.equal(tx.amount, 4.5);
});

test("upsertSleep replaces the same date", async () => {
  const api = createMockAdapter();
  const first = await api.upsertSleep({ bedtime: "22:30", wakeTime: "06:30", quality: 7, date: "2026-09-21" });
  assert.equal(first.hours, 8);
  const second = await api.upsertSleep({
    bedtime: "23:00",
    wakeTime: "07:00",
    quality: 8,
    date: "2026-09-21",
  });
  assert.equal(second.id, first.id);
  assert.equal(second.quality, 8);
  const list = await api.listSleep();
  assert.equal(list.filter((s) => s.date === "2026-09-21").length, 1);
});

test("upsertSleep validates bedtime", async () => {
  const api = createMockAdapter();
  await assert.rejects(() => api.upsertSleep({ bedtime: "9pm", wakeTime: "06:00", quality: 6 }), /HH:MM/);
});

test("createMood replaces the same calendar day", async () => {
  const api = createMockAdapter();
  await api.createMood({ mood: 5, energy: 5, stress: 5, focus: 5 });
  await api.createMood({ mood: 8, energy: 7, stress: 3, focus: 8 });
  const mood = await api.listMood();
  const today = mood[0].date;
  assert.equal(mood.filter((m) => m.date === today).length, 1);
  assert.equal(mood.find((m) => m.date === today)?.mood, 8);
});

test("simulateFailure blocks listTasks but not settings", async () => {
  const api = createMockAdapter();
  await api.updateSettings({ simulateFailure: true });
  const settings = await api.getSettings();
  assert.equal(settings.simulateFailure, true);
  await assert.rejects(() => api.listTasks(), /Simulated API failure/);
});

test("empty reset clears tasks and keeps habit catalogue", async () => {
  const api = createMockAdapter();
  await api.reset("empty");
  const [tasks, habits] = await Promise.all([api.listTasks(), api.listHabits()]);
  assert.equal(tasks.length, 0);
  assert.ok(habits.length > 0);
});
