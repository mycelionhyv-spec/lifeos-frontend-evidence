import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskDialog } from "@/components/lifeos/task-dialog";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/lifeos/data-state";
import { lifeOsApi, type Priority, type Task, type TaskStatus } from "@/lib/api";
import { keys } from "@/lib/query";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/tasks")({ component: TasksPage });

function pri(p: Priority) {
  if (p === "High") return "danger" as const;
  if (p === "Medium") return "gold" as const;
  return "default" as const;
}

function TasksPage() {
  const qc = useQueryClient();
  const tasks = useQuery({ queryKey: keys.tasks, queryFn: () => lifeOsApi.listTasks() });
  const patch = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      lifeOsApi.updateTask(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.tasks });
      qc.invalidateQueries({ queryKey: keys.today });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  const open = (tasks.data ?? []).filter((t) => t.status !== "Completed" && t.status !== "Cancelled");
  const done = (tasks.data ?? []).filter((t) => t.status === "Completed");

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="hidden text-xs font-medium tracking-widest text-gold uppercase lg:block">Tasks</p>
          <h1 className="mt-1 font-display text-4xl font-semibold">Work queue</h1>
        </div>
        <TaskDialog
          trigger={
            <Button data-testid="add-task">
              <Plus className="size-4" />
              Add
            </Button>
          }
        />
      </header>
      {tasks.isLoading && !tasks.data ? <LoadingBlock /> : null}
      {tasks.isError ? <ErrorBlock error={tasks.error} onRetry={() => void tasks.refetch()} /> : null}
      {!tasks.isError && tasks.data && open.length === 0 ? (
        <EmptyBlock title="Inbox is clear." body="Add the next move." />
      ) : null}
      {!tasks.isError && open.length > 0 ? (
        <TaskList items={open} onToggle={(t) => patch.mutate({ id: t.id, status: "Completed" })} />
      ) : null}
      {!tasks.isError && done.length > 0 ? (
        <section>
          <h2 className="mb-3 text-xs tracking-widest text-muted-foreground uppercase">Completed</h2>
          <TaskList
            items={done}
            done
            onToggle={(t) => patch.mutate({ id: t.id, status: "Inbox" })}
          />
        </section>
      ) : null}
    </div>
  );
}

function TaskList({
  items,
  done,
  onToggle,
}: {
  items: Task[];
  done?: boolean;
  onToggle: (t: Task) => void;
}) {
  return (
    <ul className="divide-y divide-border rounded-lg bg-card shadow-card" data-testid={done ? "task-done" : "task-open"}>
      {items.map((task) => (
        <li key={task.id} className="flex items-center gap-3 px-4 py-3" data-testid={`task-row-${task.id}`}>
          <Checkbox
            checked={!!done}
            onCheckedChange={() => onToggle(task)}
            aria-label={task.name}
            data-testid={`task-check-${task.id}`}
          />
          <div className="min-w-0 flex-1">
            <TaskDialog
              task={task}
              trigger={
                <button
                  type="button"
                  data-testid={`task-edit-${task.id}`}
                  className={cn(
                    "block max-w-full truncate text-left text-sm hover:underline",
                    done && "text-muted-foreground line-through",
                  )}
                >
                  {task.name}
                </button>
              }
            />
            <p className="text-xs text-muted-foreground">
              {task.status} · {task.dueDate || "No date"} · {task.lifeArea || "No area"}
            </p>
          </div>
          <Badge variant={pri(task.priority)}>{task.priority}</Badge>
        </li>
      ))}
    </ul>
  );
}
