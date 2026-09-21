import { addIsoDays, isoDate } from "../utils.ts";
import type { Habit, TxType } from "../api/types.ts";

export type CaptureKind = "task" | "transaction" | "habit" | "sleep" | "mood" | "goal" | "note";

export type CaptureProposal = {
  id: string;
  kind: CaptureKind;
  supported: boolean;
  summary: string;
  original: string;
  data: Record<string, string | number | boolean>;
};

const MONEY_RE =
  /(?:spent|paid|bought|cost|earned|income)\s+\$?\s*(\d+(?:\.\d{1,2})?)|\$\s*(\d+(?:\.\d{1,2})?)/i;

/**
 * Deterministic clause splitter. Not AI.
 * Splits on commas, semicolons, " and ", and sentence periods.
 */
export function splitClauses(input: string): string[] {
  return input
    .replace(/\s+/g, " ")
    .split(/\s*(?:,|;|\band\b|(?<=\w)\.(?=\s|$))\s*/i)
    .map((s) => s.trim().replace(/[.]+$/, ""))
    .filter((s) => s.length > 0);
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function stripDueWords(text: string) {
  return text
    .replace(/\b(today|tomorrow|next week|this week)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function dueFromText(text: string): string {
  const today = isoDate();
  if (/\btomorrow\b/i.test(text)) return addIsoDays(today, 1);
  if (/\bnext week\b/i.test(text)) return addIsoDays(today, 7);
  if (/\btoday\b/i.test(text)) return today;
  return today;
}

function moneyFromText(text: string): { amount: number; type: TxType; category: string; description: string } | null {
  const m = text.match(MONEY_RE);
  if (!m) return null;
  const amount = Number(m[1] || m[2]);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const isIncome = /\b(earned|income|got paid|received|salary)\b/i.test(text);
  const on = text.match(/\bon\s+([a-z][a-z0-9\s-]{1,40})$/i) ?? text.match(/\bon\s+([a-z][a-z0-9\s-]{1,40})/i);
  const category = on ? titleCase(on[1].trim()) : isIncome ? "Income" : "General";
  const description = text
    .replace(MONEY_RE, "")
    .replace(/\b(spent|paid|bought|cost|earned|on)\b/gi, " ")
    .replace(/\$/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    amount,
    type: isIncome ? "Income" : "Expense",
    category,
    description: description || category,
  };
}

function matchHabit(text: string, habits: Habit[]): Habit | null {
  const lower = text.toLowerCase();
  for (const habit of habits.filter((h) => h.active)) {
    const words = habit.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    if (words.some((w) => lower.includes(w))) return habit;
    if (/\bwalk(ed|ing)?\b/i.test(text) && /walk/i.test(habit.name)) return habit;
  }
  return null;
}

function looksLikeTask(text: string) {
  return /\b(pay|call|email|book|finish|review|buy|schedule|send|write|fix|clean|meet|plan)\b/i.test(
    text,
  );
}

function looksLikeSleep(text: string) {
  return /\b(slept|sleep|bedtime|woke|wake)\b/i.test(text);
}

function looksLikeMood(text: string) {
  return /\b(mood|feeling|felt|energy|stressed)\b/i.test(text);
}

function looksLikeGoal(text: string) {
  return /\b(goal|aim to|by october|by december)\b/i.test(text);
}

export function parseCapture(input: string, habits: Habit[] = []): CaptureProposal[] {
  const clauses = splitClauses(input);
  return clauses.map((original, i): CaptureProposal => {
    const id = `P${i + 1}`;
    const money = moneyFromText(original);
    if (money) {
      return {
        id,
        kind: "transaction" as const,
        supported: true,
        summary: `${money.type} ${money.amount} · ${money.description}`,
        original,
        data: {
          description: money.description,
          amount: money.amount,
          type: money.type,
          category: money.category,
        },
      };
    }
    const habit = matchHabit(original, habits);
    if (habit) {
      return {
        id,
        kind: "habit" as const,
        supported: true,
        summary: `Log habit · ${habit.name}`,
        original,
        data: { habitId: habit.id, habitName: habit.name, completed: true, date: isoDate() },
      };
    }
    if (looksLikeSleep(original)) {
      return {
        id,
        kind: "note" as const,
        supported: false,
        summary: "Sleep mention — open Health to log sleep with times",
        original,
        data: { text: original },
      };
    }
    if (looksLikeMood(original)) {
      return {
        id,
        kind: "note" as const,
        supported: false,
        summary: "Mood mention — open Health to log scores",
        original,
        data: { text: original },
      };
    }
    if (looksLikeGoal(original)) {
      const name = stripDueWords(original);
      return {
        id,
        kind: "goal" as const,
        supported: true,
        summary: `Goal · ${name}`,
        original,
        data: { name, why: "", targetValue: 100, currentValue: 0 },
      };
    }
    if (looksLikeTask(original) || /\b(today|tomorrow|next week)\b/i.test(original)) {
      const name = stripDueWords(original) || original;
      const dueDate = dueFromText(original);
      return {
        id,
        kind: "task" as const,
        supported: true,
        summary: `Task · ${name} · due ${dueDate}`,
        original,
        data: { name, dueDate, priority: "Medium" },
      };
    }
    return {
      id,
      kind: "note" as const,
      supported: false,
      summary: "Note — not saved (no matching record type)",
      original,
      data: { text: original },
    };
  });
}
