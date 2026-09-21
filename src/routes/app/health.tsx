import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, Label } from "@/components/ui/input";
import { EmptyBlock, ErrorBlock, FieldError, LoadingBlock } from "@/components/lifeos/data-state";
import { MockApiError, lifeOsApi } from "@/lib/api";
import { keys } from "@/lib/query";
import { hoursBetweenTimes, isoDate } from "@/lib/utils";

export const Route = createFileRoute("/app/health")({ component: HealthPage });

function HealthPage() {
  const qc = useQueryClient();
  const today = isoDate();
  const habits = useQuery({ queryKey: keys.habits, queryFn: () => lifeOsApi.listHabits() });
  const logs = useQuery({ queryKey: keys.habitLogs, queryFn: () => lifeOsApi.listHabitLogs() });
  const mood = useQuery({ queryKey: keys.mood, queryFn: () => lifeOsApi.listMood() });
  const sleep = useQuery({ queryKey: keys.sleep, queryFn: () => lifeOsApi.listSleep() });

  const [scores, setScores] = useState({ mood: "7", energy: "7", stress: "4", focus: "7" });
  const [moodFields, setMoodFields] = useState<Record<string, string>>({});
  const [bedtime, setBedtime] = useState("22:30");
  const [wakeTime, setWakeTime] = useState("06:30");
  const [quality, setQuality] = useState("7");
  const [sleepDate, setSleepDate] = useState(today);
  const [sleepFields, setSleepFields] = useState<Record<string, string>>({});

  const existingTonight = (sleep.data ?? []).find((s) => s.date === sleepDate);
  const previewHours = hoursBetweenTimes(bedtime, wakeTime);

  const logHabit = useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) =>
      lifeOsApi.logHabit(id, today, done),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.habitLogs });
      qc.invalidateQueries({ queryKey: keys.today });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not log."),
  });

  const saveMood = useMutation({
    mutationFn: () =>
      lifeOsApi.createMood({
        mood: Number(scores.mood),
        energy: Number(scores.energy),
        stress: Number(scores.stress),
        focus: Number(scores.focus),
      }),
    onSuccess: () => {
      toast.success("Mood recorded.");
      qc.invalidateQueries({ queryKey: keys.mood });
      qc.invalidateQueries({ queryKey: keys.today });
      setMoodFields({});
    },
    onError: (err) => {
      if (err instanceof MockApiError && err.fields) setMoodFields(err.fields);
      toast.error(err instanceof Error ? err.message : "Could not save.");
    },
  });

  const saveSleep = useMutation({
    mutationFn: () =>
      lifeOsApi.upsertSleep({
        date: sleepDate,
        bedtime,
        wakeTime,
        quality: Number(quality),
      }),
    onSuccess: (entry) => {
      toast.success(existingTonight ? "Sleep updated for that day." : "Sleep logged.");
      qc.invalidateQueries({ queryKey: keys.sleep });
      setSleepFields({});
      setBedtime(entry.bedtime);
      setWakeTime(entry.wakeTime);
      setQuality(String(entry.quality ?? 7));
    },
    onError: (err) => {
      if (err instanceof MockApiError && err.fields) setSleepFields(err.fields);
      toast.error(err instanceof Error ? err.message : "Could not save.");
    },
  });

  const loading = habits.isLoading || logs.isLoading || mood.isLoading || sleep.isLoading;

  return (
    <div className="space-y-6">
      <header>
        <p className="hidden text-xs font-medium tracking-widest text-gold uppercase lg:block">Health</p>
        <h1 className="mt-1 font-display text-4xl font-semibold">Body and signal</h1>
      </header>
      {loading && !habits.data ? <LoadingBlock /> : null}
      {habits.isError ? <ErrorBlock error={habits.error} onRetry={() => void habits.refetch()} /> : null}

      {!habits.isError ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Habits today</CardTitle>
            </CardHeader>
            <ul className="space-y-2">
              {(habits.data ?? []).map((h) => {
                const done = (logs.data ?? []).some(
                  (l) => l.habitId === h.id && l.date === today && l.completed,
                );
                return (
                  <li key={h.id} className="flex h-11 items-center gap-3">
                    <Checkbox
                      checked={done}
                      onCheckedChange={(v) => logHabit.mutate({ id: h.id, done: v === true })}
                      aria-label={h.name}
                      data-testid={`habit-${h.id}`}
                    />
                    <span className="text-sm">{h.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {h.targetPerWeek}/week
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Record mood</CardTitle>
            </CardHeader>
            <form
              className="grid grid-cols-2 gap-3 sm:grid-cols-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveMood.mutate();
              }}
            >
              {(["mood", "energy", "stress", "focus"] as const).map((key) => (
                <div key={key}>
                  <Label htmlFor={`h-${key}`} className="capitalize">
                    {key} (1–10)
                  </Label>
                  <Input
                    id={`h-${key}`}
                    data-testid={`mood-${key}`}
                    inputMode="numeric"
                    value={scores[key]}
                    onChange={(e) => setScores((s) => ({ ...s, [key]: e.target.value }))}
                  />
                  <FieldError message={moodFields[key]} />
                </div>
              ))}
              <div className="col-span-2 sm:col-span-4">
                <Button type="submit" data-testid="save-mood" disabled={saveMood.isPending}>
                  {saveMood.isPending ? "Saving…" : "Save check-in"}
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sleep log</CardTitle>
            </CardHeader>
            <p className="mb-4 text-sm text-muted-foreground">
              One entry per night. Saving the same date replaces the previous record.
            </p>
            <form
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveSleep.mutate();
              }}
            >
              <div>
                <Label htmlFor="sleep-date">Night of</Label>
                <Input
                  id="sleep-date"
                  data-testid="sleep-date"
                  type="date"
                  value={sleepDate}
                  onChange={(e) => setSleepDate(e.target.value)}
                />
                <FieldError message={sleepFields.date} />
              </div>
              <div>
                <Label htmlFor="sleep-bed">Bedtime</Label>
                <Input
                  id="sleep-bed"
                  data-testid="sleep-bedtime"
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                />
                <FieldError message={sleepFields.bedtime} />
              </div>
              <div>
                <Label htmlFor="sleep-wake">Wake</Label>
                <Input
                  id="sleep-wake"
                  data-testid="sleep-waketime"
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                />
                <FieldError message={sleepFields.wakeTime} />
              </div>
              <div>
                <Label htmlFor="sleep-quality">Quality (1–10)</Label>
                <Input
                  id="sleep-quality"
                  data-testid="sleep-quality"
                  inputMode="numeric"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                />
                <FieldError message={sleepFields.quality} />
              </div>
              <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-3">
                <Button type="submit" data-testid="save-sleep" disabled={saveSleep.isPending}>
                  {saveSleep.isPending
                    ? "Saving…"
                    : existingTonight
                      ? "Replace this night"
                      : "Log sleep"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  {previewHours != null ? `${previewHours} hours` : "Enter valid times"}
                </p>
              </div>
            </form>
          </Card>

          {(sleep.data ?? []).length === 0 ? (
            <EmptyBlock title="No sleep logged." body="Log last night to start the series." />
          ) : (
            <ul className="divide-y divide-border rounded-lg bg-card shadow-card" data-testid="sleep-list">
              {(sleep.data ?? []).slice(0, 7).map((s) => (
                <li key={s.id} className="flex justify-between gap-3 px-4 py-3 text-sm">
                  <span>{s.date}</span>
                  <span className="font-mono text-muted-foreground tabular-nums">
                    {s.bedtime}–{s.wakeTime} · {s.hours}h · Q{s.quality}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {(mood.data ?? []).length > 0 ? (
            <ul className="divide-y divide-border rounded-lg bg-card shadow-card">
              {(mood.data ?? []).slice(0, 7).map((m) => (
                <li key={m.id} className="flex justify-between px-4 py-3 text-sm">
                  <span>{m.date}</span>
                  <span className="font-mono text-muted-foreground tabular-nums">
                    M{m.mood} E{m.energy} S{m.stress} F{m.focus}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
