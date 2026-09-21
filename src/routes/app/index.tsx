import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TaskDialog } from "@/components/lifeos/task-dialog";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/lifeos/data-state";
import { lifeOsApi, type Priority } from "@/lib/api";
import { keys } from "@/lib/query";
import { cn, formatDayLabel, formatMoney, hourInTz } from "@/lib/utils";

export const Route = createFileRoute("/app/")({ component: Today });

function greeting() {
  const h = hourInTz();
  if (h < 12) return "Good morning.";
  if (h < 18) return "Good afternoon.";
  return "Good evening.";
}

function Ring({ value }: { value: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <svg viewBox="0 0 96 96" className="mx-auto size-28" aria-hidden="true">
      <circle cx="48" cy="48" r={r} fill="none" className="stroke-muted" strokeWidth="8" />
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        className="stroke-gold"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (v / 100) * c}
        transform="rotate(-90 48 48)"
      />
      <text
        x="48"
        y="52"
        textAnchor="middle"
        className="fill-foreground font-mono text-lg"
        fontSize="16"
      >
        {v}%
      </text>
    </svg>
  );
}

function pri(p: Priority) {
  if (p === "High") return "danger" as const;
  if (p === "Medium") return "gold" as const;
  return "default" as const;
}

function Today() {
  const qc = useQueryClient();
  const today = useQuery({ queryKey: keys.today, queryFn: () => lifeOsApi.getToday() });
  const settings = useQuery({ queryKey: keys.settings, queryFn: () => lifeOsApi.getSettings() });
  const complete = useMutation({
    mutationFn: (id: string) => lifeOsApi.updateTask(id, { status: "Completed" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.today });
      qc.invalidateQueries({ queryKey: keys.tasks });
    },
  });

  const snapshot = today.data;
  const currency = settings.data?.currency ?? "AUD";
  const denom = Math.max(snapshot?.habitsTarget ?? 1, 1);
  const habitPct = snapshot ? Math.round((snapshot.habitsToday / denom) * 100) : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="hidden text-xs font-medium tracking-widest text-gold uppercase lg:block">
            Today
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight">{greeting()}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Progress today. A brighter tomorrow. · {formatDayLabel()}
          </p>
        </div>
        <TaskDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Add task
            </Button>
          }
        />
      </header>

      {today.isLoading && !snapshot ? <LoadingBlock label="Loading today" /> : null}
      {today.isError ? (
        <ErrorBlock error={today.error} onRetry={() => void today.refetch()} />
      ) : null}

      {snapshot && !today.isError ? (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Due today", String(snapshot.tasksDueToday)],
              ["Overdue", String(snapshot.overdueTasks)],
              ["Remaining", formatMoney(snapshot.moneyRemaining, currency)],
              ["Energy 7d", snapshot.energyAvg7 == null ? "—" : String(snapshot.energyAvg7)],
            ].map(([k, v]) => (
              <Card key={k} className="p-4">
                <p className="text-xs tracking-widest text-muted-foreground uppercase">{k}</p>
                <p className="mt-2 font-display text-2xl tabular-nums">{v}</p>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Must move</CardTitle>
                <Link to="/app/tasks" className="text-xs text-muted-foreground hover:text-foreground">
                  All tasks
                </Link>
              </CardHeader>
              {snapshot.focus.length === 0 ? (
                <EmptyBlock
                  title="Nothing due."
                  body="Add a task or enjoy the quiet."
                  action={<TaskDialog trigger={<Button size="sm">Add task</Button>} />}
                />
              ) : (
                <ul className="divide-y divide-border">
                  {snapshot.focus.map((task) => (
                    <li key={task.id} className="flex items-center gap-3 py-3">
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => complete.mutate(task.id)}
                        aria-label={`Complete ${task.name}`}
                      />
                      <div className="min-w-0 flex-1">
                        <TaskDialog
                          task={task}
                          trigger={
                            <button
                              type="button"
                              className="block max-w-full truncate text-left text-sm hover:underline"
                            >
                              {task.name}
                            </button>
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          {task.dueDate} · {task.lifeArea || "No area"}
                        </p>
                      </div>
                      <Badge variant={pri(task.priority)}>{task.priority}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Habits today</CardTitle>
                <Link to="/app/health" className="text-xs text-muted-foreground hover:text-foreground">
                  Health
                </Link>
              </CardHeader>
              <Ring value={habitPct} />
              <p className={cn("text-center text-sm text-muted-foreground")}>
                {snapshot.habitsToday} of {snapshot.habitsTarget} logged
              </p>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  );
}
