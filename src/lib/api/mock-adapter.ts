import seed from "./fixtures/seed.json" with { type: "json" };
import { hoursBetweenTimes, isHhMm, isoDate, uid } from "../utils.ts";
import type {
  CreateGoalInput,
  CreateMoodInput,
  CreateTaskInput,
  CreateTransactionInput,
  Goal,
  Habit,
  HabitLog,
  LifeOsAdapter,
  MoodEntry,
  Settings,
  SleepEntry,
  Task,
  TodaySnapshot,
  Transaction,
  UpdateGoalInput,
  UpdateTaskInput,
  UpsertSleepInput,
} from "./types";

export const STORAGE_KEY = "lifeos.mock.v2";
const LATENCY_MS = 280;

type Db = {
  settings: Settings;
  tasks: Task[];
  goals: Goal[];
  transactions: Transaction[];
  habits: Habit[];
  habitLogs: HabitLog[];
  mood: MoodEntry[];
  sleep: SleepEntry[];
};

function cloneSeed(mode: "seed" | "empty"): Db {
  if (mode === "empty") {
    return {
      settings: { ...(seed.settings as Settings), simulateFailure: false },
      tasks: [],
      goals: [],
      transactions: [],
      habits: seed.habits as Habit[],
      habitLogs: [],
      mood: [],
      sleep: [],
    };
  }
  return structuredClone(seed) as Db;
}

function load(): Db {
  if (typeof localStorage === "undefined") return cloneSeed("seed");
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed("seed");
    const parsed = JSON.parse(raw) as Db;
    if (!Array.isArray(parsed.goals) || !Array.isArray(parsed.tasks)) return cloneSeed("seed");
    return parsed;
  } catch {
    return cloneSeed("seed");
  }
}

function save(db: Db) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export class MockApiError extends Error {
  code: "VALIDATION" | "FAILURE" | "NOT_FOUND";
  fields?: Record<string, string>;
  constructor(
    code: "VALIDATION" | "FAILURE" | "NOT_FOUND",
    message: string,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "MockApiError";
    this.code = code;
    this.fields = fields;
  }
}

function wait() {
  return new Promise((r) => setTimeout(r, LATENCY_MS));
}

function validateName(name: string, label: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new MockApiError("VALIDATION", `${label} name is required.`, { name: `Enter a ${label.toLowerCase()} name.` });
  }
  if (trimmed.length > 80) {
    throw new MockApiError("VALIDATION", `${label} name is too long.`, { name: "80 characters max." });
  }
  return trimmed;
}

function goalProgress(currentValue: number, targetValue: number) {
  if (!Number.isFinite(targetValue) || targetValue <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((currentValue / targetValue) * 100)));
}

function buildToday(db: Db): TodaySnapshot {
  const today = isoDate();
  const open = db.tasks.filter((t) => t.status !== "Completed" && t.status !== "Cancelled");
  const dueToday = open.filter((t) => t.dueDate === today);
  const overdue = open.filter((t) => t.dueDate && t.dueDate < today);
  const focus = [...overdue, ...dueToday].slice(0, 8);
  const upcoming = open
    .filter((t) => t.dueDate > today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6);
  const income = db.transactions.filter((t) => t.type === "Income").reduce((s, t) => s + t.amount, 0);
  const spend = db.transactions.filter((t) => t.type === "Expense").reduce((s, t) => s + t.amount, 0);
  const weekMood = db.mood.slice(-7);
  const energyAvg7 =
    weekMood.length === 0
      ? null
      : Math.round((weekMood.reduce((s, m) => s + m.energy, 0) / weekMood.length) * 10) / 10;
  const habitsToday = db.habitLogs.filter((l) => l.date === today && l.completed).length;
  return {
    tasksDueToday: dueToday.length,
    overdueTasks: overdue.length,
    habitsToday,
    habitsTarget: db.habits.filter((h) => h.active).length,
    activeGoals: db.goals.filter((g) => g.status === "Active").length,
    moneyRemaining: income - spend,
    energyAvg7,
    focus,
    upcoming,
    goals: db.goals.filter((g) => g.status === "Active"),
  };
}

export function createMockAdapter(): LifeOsAdapter {
  let db = load();

  async function gate<T>(run: () => T): Promise<T> {
    await wait();
    if (db.settings.simulateFailure) {
      throw new MockApiError("FAILURE", "Simulated API failure. Turn this off in Settings.");
    }
    const result = run();
    save(db);
    return result;
  }

  async function mutating<T>(run: () => T): Promise<T> {
    await wait();
    if (db.settings.simulateFailure) {
      throw new MockApiError("FAILURE", "Simulated API failure. Turn this off in Settings.");
    }
    const result = run();
    save(db);
    return result;
  }

  return {
    async getSettings() {
      await wait();
      return { ...db.settings };
    },
    async updateSettings(patch) {
      await wait();
      db.settings = { ...db.settings, ...patch };
      save(db);
      return { ...db.settings };
    },
    async listTasks() {
      return gate(() => [...db.tasks]);
    },
    async createTask(input: CreateTaskInput) {
      return mutating(() => {
        const name = validateName(input.name, "Task");
        const task: Task = {
          id: `TSK-${uid().slice(0, 8)}`,
          name,
          description: input.description?.trim() ?? "",
          lifeArea: input.lifeArea ?? "",
          project: "",
          priority: input.priority ?? "Medium",
          status: "Inbox",
          startDate: isoDate(),
          dueDate: input.dueDate ?? "",
          recurring: false,
          estTime: null,
          actualTime: null,
          created: new Date().toISOString(),
          completed: "",
        };
        db.tasks = [task, ...db.tasks];
        return task;
      });
    },
    async updateTask(id: string, patch: UpdateTaskInput) {
      return mutating(() => {
        const idx = db.tasks.findIndex((t) => t.id === id);
        if (idx < 0) throw new MockApiError("NOT_FOUND", "Task not found.");
        const nextPatch = { ...patch };
        if (nextPatch.name !== undefined) nextPatch.name = validateName(nextPatch.name, "Task");
        const next = { ...db.tasks[idx], ...nextPatch };
        if (patch.status === "Completed" && !next.completed) next.completed = new Date().toISOString();
        if (patch.status && patch.status !== "Completed") next.completed = "";
        db.tasks[idx] = next;
        return { ...next };
      });
    },
    async listGoals() {
      return gate(() => [...db.goals]);
    },
    async createGoal(input: CreateGoalInput) {
      return mutating(() => {
        const name = validateName(input.name, "Goal");
        const targetValue = input.targetValue ?? 100;
        const currentValue = input.currentValue ?? 0;
        if (!Number.isFinite(targetValue) || targetValue <= 0) {
          throw new MockApiError("VALIDATION", "Target must be greater than zero.", {
            targetValue: "Enter a positive target.",
          });
        }
        if (!Number.isFinite(currentValue) || currentValue < 0) {
          throw new MockApiError("VALIDATION", "Current value cannot be negative.", {
            currentValue: "Enter zero or more.",
          });
        }
        const goal: Goal = {
          id: `GOL-${uid().slice(0, 8)}`,
          name,
          lifeArea: input.lifeArea ?? "",
          why: input.why?.trim() ?? "",
          startDate: isoDate(),
          targetDate: input.targetDate ?? "",
          status: input.status ?? "Active",
          targetValue,
          currentValue,
          progress: goalProgress(currentValue, targetValue),
          linkedProject: "",
          nextAction: input.nextAction?.trim() ?? "",
        };
        db.goals = [goal, ...db.goals];
        return goal;
      });
    },
    async updateGoal(id: string, patch: UpdateGoalInput) {
      return mutating(() => {
        const idx = db.goals.findIndex((g) => g.id === id);
        if (idx < 0) throw new MockApiError("NOT_FOUND", "Goal not found.");
        const nextPatch = { ...patch };
        if (nextPatch.name !== undefined) nextPatch.name = validateName(nextPatch.name, "Goal");
        const next = { ...db.goals[idx], ...nextPatch };
        if (next.targetValue <= 0) {
          throw new MockApiError("VALIDATION", "Target must be greater than zero.", {
            targetValue: "Enter a positive target.",
          });
        }
        if (next.currentValue < 0) {
          throw new MockApiError("VALIDATION", "Current value cannot be negative.", {
            currentValue: "Enter zero or more.",
          });
        }
        next.progress = goalProgress(next.currentValue, next.targetValue);
        db.goals[idx] = next;
        return { ...next };
      });
    },
    async listTransactions() {
      return gate(() => [...db.transactions]);
    },
    async createTransaction(input: CreateTransactionInput) {
      return mutating(() => {
        const description = input.description.trim();
        if (!description) {
          throw new MockApiError("VALIDATION", "Description is required.", {
            description: "What was this for?",
          });
        }
        if (!Number.isFinite(input.amount) || input.amount <= 0) {
          throw new MockApiError("VALIDATION", "Amount must be greater than zero.", {
            amount: "Enter a positive amount.",
          });
        }
        const tx: Transaction = {
          id: `TXN-${uid().slice(0, 8)}`,
          date: isoDate(),
          description,
          category: input.category ?? "",
          type: input.type,
          account: input.account ?? "",
          amount: Math.round(input.amount * 100) / 100,
          fixedVariable: "",
          notes: "",
        };
        db.transactions = [tx, ...db.transactions];
        return tx;
      });
    },
    async listHabits() {
      return gate(() => [...db.habits]);
    },
    async listHabitLogs() {
      return gate(() => [...db.habitLogs]);
    },
    async logHabit(habitId, date, completed) {
      return gate(() => {
        const habit = db.habits.find((h) => h.id === habitId);
        if (!habit) throw new MockApiError("NOT_FOUND", "Habit not found.");
        const existing = db.habitLogs.find((l) => l.habitId === habitId && l.date === date);
        if (existing) {
          existing.completed = completed;
          return { ...existing };
        }
        const log: HabitLog = { id: `HLOG-${uid().slice(0, 8)}`, habitId, date, completed };
        db.habitLogs = [log, ...db.habitLogs];
        return { ...log };
      });
    },
    async listMood() {
      return gate(() => [...db.mood]);
    },
    async createMood(input: CreateMoodInput) {
      return mutating(() => {
        for (const key of ["mood", "energy", "stress", "focus"] as const) {
          const n = input[key];
          if (!Number.isInteger(n) || n < 1 || n > 10) {
            throw new MockApiError("VALIDATION", "Scores must be whole numbers from 1 to 10.", {
              [key]: "Use 1–10.",
            });
          }
        }
        const entry: MoodEntry = {
          id: `MOO-${uid().slice(0, 8)}`,
          date: isoDate(),
          mood: input.mood,
          energy: input.energy,
          stress: input.stress,
          focus: input.focus,
          notes: input.notes?.trim() ?? "",
        };
        db.mood = [entry, ...db.mood.filter((m) => m.date !== entry.date)];
        return entry;
      });
    },
    async listSleep() {
      return gate(() => [...db.sleep]);
    },
    async upsertSleep(input: UpsertSleepInput) {
      return mutating(() => {
        const date = (input.date ?? isoDate()).trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          throw new MockApiError("VALIDATION", "Date is required.", { date: "Use YYYY-MM-DD." });
        }
        if (!isHhMm(input.bedtime)) {
          throw new MockApiError("VALIDATION", "Bedtime must be HH:MM.", { bedtime: "Use 24h HH:MM." });
        }
        if (!isHhMm(input.wakeTime)) {
          throw new MockApiError("VALIDATION", "Wake time must be HH:MM.", { wakeTime: "Use 24h HH:MM." });
        }
        if (!Number.isInteger(input.quality) || input.quality < 1 || input.quality > 10) {
          throw new MockApiError("VALIDATION", "Quality must be 1–10.", { quality: "Use 1–10." });
        }
        const computed = hoursBetweenTimes(input.bedtime, input.wakeTime);
        let hours = input.hours == null || input.hours === undefined ? computed : Number(input.hours);
        if (hours == null || !Number.isFinite(hours) || hours <= 0 || hours > 24) {
          throw new MockApiError("VALIDATION", "Hours must be between 0 and 24.", {
            hours: "Enter hours or valid times.",
          });
        }
        hours = Math.round(hours * 10) / 10;
        const entry: SleepEntry = {
          id: `SLP-${uid().slice(0, 8)}`,
          date,
          bedtime: input.bedtime,
          wakeTime: input.wakeTime,
          hours,
          quality: input.quality,
          notes: input.notes?.trim() ?? "",
        };
        const existing = db.sleep.findIndex((s) => s.date === date);
        if (existing >= 0) {
          entry.id = db.sleep[existing].id;
          db.sleep[existing] = entry;
        } else {
          db.sleep = [entry, ...db.sleep];
        }
        return { ...entry };
      });
    },
    async getToday() {
      return gate(() => buildToday(db));
    },
    async reset(mode) {
      await wait();
      db = cloneSeed(mode);
      save(db);
    },
  };
}

export const lifeOsApi: LifeOsAdapter = createMockAdapter();
