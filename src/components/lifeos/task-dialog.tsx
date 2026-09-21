import { useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input, Label, NativeSelect, Textarea } from "@/components/ui/input";
import { FieldError } from "@/components/lifeos/data-state";
import {
  MockApiError,
  lifeOsApi,
  type LifeArea,
  type Priority,
  type Task,
} from "@/lib/api";
import { keys } from "@/lib/query";
import { isoDate } from "@/lib/utils";

const AREAS: LifeArea[] = [
  "Personal",
  "Work",
  "Health",
  "Finance",
  "Home",
  "Relationships",
  "Learning",
];

export function TaskDialog({
  trigger,
  task,
}: {
  trigger: ReactNode;
  task?: Task;
}) {
  const qc = useQueryClient();
  const isEdit = Boolean(task);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lifeArea, setLifeArea] = useState<LifeArea | "">("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [dueDate, setDueDate] = useState(isoDate());
  const [fields, setFields] = useState<Record<string, string>>({});

  function hydrate() {
    setName(task?.name ?? "");
    setDescription(task?.description ?? "");
    setLifeArea(task?.lifeArea ?? "");
    setPriority(task?.priority ?? "Medium");
    setDueDate(task?.dueDate || isoDate());
    setFields({});
  }

  const mutation = useMutation({
    mutationFn: () =>
      task
        ? lifeOsApi.updateTask(task.id, { name, description, lifeArea, priority, dueDate })
        : lifeOsApi.createTask({ name, description, lifeArea, priority, dueDate }),
    onSuccess: () => {
      toast.success(isEdit ? "Task updated." : "Task added.");
      qc.invalidateQueries({ queryKey: keys.tasks });
      qc.invalidateQueries({ queryKey: keys.today });
      setOpen(false);
    },
    onError: (err) => {
      if (err instanceof MockApiError && err.fields) setFields(err.fields);
      toast.error(err instanceof Error ? err.message : "Could not save.");
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) hydrate();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogTitle className="font-display text-xl font-medium">
          {isEdit ? "Edit task" : "New task"}
        </DialogTitle>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div>
            <Label htmlFor="task-name">Name</Label>
            <Input
              id="task-name"
              data-testid="task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              autoComplete="off"
            />
            <FieldError message={fields.name} />
          </div>
          <div>
            <Label htmlFor="task-due">Due</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="task-priority">Priority</Label>
              <NativeSelect
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </NativeSelect>
            </div>
            <div>
              <Label htmlFor="task-area">Life area</Label>
              <NativeSelect
                id="task-area"
                value={lifeArea}
                onChange={(e) => setLifeArea(e.target.value as LifeArea | "")}
              >
                <option value="">None</option>
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </NativeSelect>
            </div>
          </div>
          <div>
            <Label htmlFor="task-notes">Notes</Label>
            <Textarea
              id="task-notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" data-testid="task-save" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Add task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
