import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/input";
import { ErrorBlock, LoadingBlock } from "@/components/lifeos/data-state";
import { parseCapture, type CaptureKind, type CaptureProposal } from "@/lib/capture/parse";
import { lifeOsApi, type TxType } from "@/lib/api";
import { keys } from "@/lib/query";

export const Route = createFileRoute("/app/capture")({ component: CapturePage });

type CardState = CaptureProposal & { decision: "approved" | "rejected" | "pending" };

const EXAMPLE = "Pay electricity tomorrow, spent $62 on groceries and walked for 30 minutes.";

function kindLabel(kind: CaptureKind) {
  if (kind === "transaction") return "Transaction";
  if (kind === "habit") return "Habit";
  if (kind === "task") return "Task";
  if (kind === "goal") return "Goal";
  if (kind === "sleep") return "Sleep";
  if (kind === "mood") return "Mood";
  return "Note";
}

async function commitOne(item: CardState) {
  if (!item.supported) {
    return { id: item.id, ok: false, reason: "Unsupported type — not saved" };
  }
  switch (item.kind) {
    case "task":
      await lifeOsApi.createTask({
        name: String(item.data.name),
        dueDate: String(item.data.dueDate ?? ""),
        priority: item.data.priority === "High" || item.data.priority === "Low" ? item.data.priority : "Medium",
      });
      return { id: item.id, ok: true, reason: "Task created" };
    case "transaction":
      await lifeOsApi.createTransaction({
        description: String(item.data.description),
        amount: Number(item.data.amount),
        type: (item.data.type as TxType) || "Expense",
        category: String(item.data.category ?? ""),
      });
      return { id: item.id, ok: true, reason: "Transaction logged" };
    case "habit":
      await lifeOsApi.logHabit(String(item.data.habitId), String(item.data.date), true);
      return { id: item.id, ok: true, reason: `Habit logged: ${item.data.habitName}` };
    case "goal":
      await lifeOsApi.createGoal({
        name: String(item.data.name),
        why: String(item.data.why ?? ""),
        targetValue: Number(item.data.targetValue ?? 100),
        currentValue: Number(item.data.currentValue ?? 0),
      });
      return { id: item.id, ok: true, reason: "Goal created" };
    default:
      return { id: item.id, ok: false, reason: "Unsupported type — not saved" };
  }
}

function CapturePage() {
  const qc = useQueryClient();
  const habits = useQuery({ queryKey: keys.habits, queryFn: () => lifeOsApi.listHabits() });
  const [text, setText] = useState(EXAMPLE);
  const [cards, setCards] = useState<CardState[]>([]);
  const [results, setResults] = useState<{ id: string; ok: boolean; reason: string }[] | null>(null);

  const parsedCount = useMemo(() => cards.length, [cards]);

  const commit = useMutation({
    mutationFn: async () => {
      const approved = cards.filter((c) => c.decision === "approved");
      const out = [];
      for (const item of approved) {
        out.push(await commitOne(item));
      }
      return out;
    },
    onSuccess: (out) => {
      setResults(out);
      const saved = out.filter((r) => r.ok).length;
      const skipped = out.filter((r) => !r.ok).length;
      toast.success(`${saved} saved. ${skipped} not saved.`);
      qc.invalidateQueries();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Commit failed."),
  });

  function parseNow() {
    setResults(null);
    const proposals = parseCapture(text, habits.data ?? []);
    setCards(
      proposals.map((p) => ({
        ...p,
        decision: p.supported ? "approved" : "rejected",
      })),
    );
  }

  function patch(id: string, data: Record<string, string | number | boolean>) {
    setCards((list) => list.map((c) => (c.id === id ? { ...c, data: { ...c.data, ...data } } : c)));
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="hidden text-xs font-medium tracking-widest text-gold uppercase lg:block">
          Nexus Capture
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold">Say it once</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          One line in. Proposed records out. This is a deterministic prototype — pattern matching,
          not a model. Unsupported types are labelled and are not written.
        </p>
      </header>

      {habits.isLoading && !habits.data ? <LoadingBlock /> : null}
      {habits.isError ? <ErrorBlock error={habits.error} onRetry={() => void habits.refetch()} /> : null}

      {!habits.isError ? (
        <>
          <Card>
            <Label htmlFor="capture-input">Capture line</Label>
            <Textarea
              id="capture-input"
              data-testid="capture-input"
              className="mt-2"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                data-testid="capture-parse"
                onClick={parseNow}
                disabled={!text.trim() || !habits.isSuccess}
              >
                Parse
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setText(EXAMPLE);
                  setCards([]);
                  setResults(null);
                }}
              >
                Reset example
              </Button>
            </div>
          </Card>

          {parsedCount === 0 ? (
            <p className="text-sm text-muted-foreground">Parse a line to see proposed records.</p>
          ) : (
            <ul className="grid gap-3" data-testid="capture-cards">
              {cards.map((card) => (
                <li key={card.id}>
                  <Card data-testid={`capture-card-${card.id}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={card.supported ? "gold" : "default"}>{kindLabel(card.kind)}</Badge>
                      {card.supported ? (
                        <span className="text-xs text-muted-foreground">Can save through adapter</span>
                      ) : (
                        <span className="text-xs text-destructive">Will not be saved</span>
                      )}
                      <span className="ml-auto font-mono text-xs text-muted-foreground">{card.id}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{card.original}</p>
                    {card.kind === "task" ? (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={String(card.data.name)}
                            onChange={(e) => patch(card.id, { name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Due</Label>
                          <Input
                            type="date"
                            value={String(card.data.dueDate)}
                            onChange={(e) => patch(card.id, { dueDate: e.target.value })}
                          />
                        </div>
                      </div>
                    ) : null}
                    {card.kind === "transaction" ? (
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <Label>Description</Label>
                          <Input
                            value={String(card.data.description)}
                            onChange={(e) => patch(card.id, { description: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Amount</Label>
                          <Input
                            inputMode="decimal"
                            value={String(card.data.amount)}
                            onChange={(e) => patch(card.id, { amount: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <NativeSelect
                            value={String(card.data.type)}
                            onChange={(e) => patch(card.id, { type: e.target.value })}
                          >
                            <option>Expense</option>
                            <option>Income</option>
                          </NativeSelect>
                        </div>
                      </div>
                    ) : null}
                    {card.kind === "habit" ? (
                      <p className="mt-3 text-sm">
                        Will mark <strong>{String(card.data.habitName)}</strong> complete for today.
                      </p>
                    ) : null}
                    {card.kind === "goal" ? (
                      <div className="mt-3">
                        <Label>Name</Label>
                        <Input
                          value={String(card.data.name)}
                          onChange={(e) => patch(card.id, { name: e.target.value })}
                        />
                      </div>
                    ) : null}
                    {card.kind === "note" ? (
                      <p className="mt-3 text-sm">Kept as a proposal only. No adapter method for notes.</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={card.decision === "approved" ? "default" : "outline"}
                        data-testid={`capture-approve-${card.id}`}
                        disabled={!card.supported}
                        onClick={() =>
                          setCards((list) =>
                            list.map((c) => (c.id === card.id ? { ...c, decision: "approved" } : c)),
                          )
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant={card.decision === "rejected" ? "default" : "ghost"}
                        data-testid={`capture-reject-${card.id}`}
                        onClick={() =>
                          setCards((list) =>
                            list.map((c) => (c.id === card.id ? { ...c, decision: "rejected" } : c)),
                          )
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}

          {parsedCount > 0 ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                data-testid="capture-commit"
                disabled={commit.isPending || !cards.some((c) => c.decision === "approved")}
                onClick={() => commit.mutate()}
              >
                {commit.isPending ? "Committing…" : "Commit approved"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Rejected and unsupported items are skipped on purpose.
              </p>
            </div>
          ) : null}

          {results ? (
            <ul className="divide-y divide-border rounded-lg bg-card shadow-card" data-testid="capture-results">
              {results.map((r) => (
                <li key={r.id} className="flex justify-between gap-3 px-4 py-3 text-sm">
                  <span>{r.id}</span>
                  <span className={r.ok ? "text-success" : "text-muted-foreground"}>{r.reason}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <p className="text-xs text-muted-foreground">
            After commit, inspect{" "}
            <Link to="/app/tasks" className="underline">
              Tasks
            </Link>
            ,{" "}
            <Link to="/app/money" className="underline">
              Money
            </Link>{" "}
            and{" "}
            <Link to="/app/health" className="underline">
              Health
            </Link>
            .
          </p>
        </>
      ) : null}
    </div>
  );
}
