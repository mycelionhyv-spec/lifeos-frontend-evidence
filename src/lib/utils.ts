import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid() {
  return crypto.randomUUID();
}

export const APP_TZ = "Australia/Perth";

export function formatMoney(n: number, currency = "AUD") {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function tzParts(d: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-AU", { timeZone: APP_TZ, ...options }).formatToParts(d);
}

function pick(parts: Intl.DateTimeFormatPart[], type: string) {
  return parts.find((p) => p.type === type)?.value ?? "";
}

export function isoDate(d = new Date()) {
  const parts = tzParts(d, { year: "numeric", month: "2-digit", day: "2-digit" });
  return `${pick(parts, "year")}-${pick(parts, "month")}-${pick(parts, "day")}`;
}

export function addIsoDays(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

export function formatDayLabel(d = new Date()) {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: APP_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

export function hourInTz(d = new Date()) {
  const parts = tzParts(d, { hour: "numeric", hourCycle: "h23" });
  return Number(pick(parts, "hour"));
}

export function startOfWeek(d = new Date()) {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function weekRange(d = new Date()) {
  const start = startOfWeek(d);
  return { start: isoDate(start), end: isoDate(addDays(start, 6)) };
}

export function inWeek(date: string, d = new Date()) {
  const { start, end } = weekRange(d);
  return date >= start && date <= end;
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isHhMm(value: string) {
  return TIME_RE.test(value);
}

export function hoursBetweenTimes(bedtime: string, wakeTime: string) {
  if (!isHhMm(bedtime) || !isHhMm(wakeTime)) return null;
  const [bh, bm] = bedtime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);
  const start = bh * 60 + bm;
  let end = wh * 60 + wm;
  if (end <= start) end += 24 * 60;
  return Math.round(((end - start) / 60) * 10) / 10;
}
