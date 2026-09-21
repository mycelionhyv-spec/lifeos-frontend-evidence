import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/lifeos/data-state";
import { GoalDialog } from "@/components/lifeos/goal-dialog";
import { lifeOsApi } from "@/lib/api";
import { keys } from "@/lib/query";

export const Route = createFileRoute("/app/goals")({ component: GoalsPage });

function GoalsPage() {
  const goals = useQuery({ queryKey: keys.goals, queryFn: () => lifeOsApi.listGoals() });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="hidden text-xs font-medium tracking-widest text-gold uppercase lg:block">Goals</p>
          <h1 className="mt-1 font-display text-4xl font-semibold">What compounds</h1>
        </div>
        <GoalDialog
          trigger={
            <Button data-testid="add-goal">
              <Plus className="size-4" />
              Add
            </Button>
          }
        />
      </header>
      {goals.isLoading && !goals.data ? <LoadingBlock /> : null}
      {goals.isError ? <ErrorBlock error={goals.error} onRetry={() => void goals.refetch()} /> : null}
      {!goals.isError && goals.data?.length === 0 ? (
        <EmptyBlock
          title="No goals yet."
          body="Name the outcome. LifeOS will keep the number honest."
          action={
            <GoalDialog trigger={<Button size="sm">Add goal</Button>} />
          }
        />
      ) : null}
      {!goals.isError ? (
        <ul className="grid gap-4">
          {(goals.data ?? []).map((g) => (
            <li key={g.id}>
              <Card data-testid={`goal-card-${g.id}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <GoalDialog
                      goal={g}
                      trigger={
                        <button
                          type="button"
                          className="block max-w-full truncate text-left font-display text-xl hover:underline"
                          data-testid={`goal-edit-${g.id}`}
                        >
                          {g.name}
                        </button>
                      }
                    />
                    <p className="mt-1 text-sm text-muted-foreground">{g.why}</p>
                  </div>
                  <p className="font-mono text-sm tabular-nums">{g.progress}%</p>
                </div>
                <Progress value={g.progress} className="mt-4" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Next: {g.nextAction || "—"} · {g.lifeArea || "No area"}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
