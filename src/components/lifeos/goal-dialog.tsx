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
  type Goal,
  type GoalStatus,
  type LifeArea,
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

export function GoalDialog({
  trigger,
  goal,
}: {
  trigger: ReactNode;
  goal?: Goal;
}) {
  const qc = useQueryClient();
  const isEdit = Boolean(goal);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [why, setWhy] = useState("");
  const [lifeArea, setLifeArea] = useState<LifeArea | "">("");
  const [targetDate, setTargetDate] = useState("");
  const [targetValue, setTargetValue] = useState("100");
  const [currentValue, setCurrentValue] = useState("0");
  const [nextAction, setNextAction] = useState("");
  const [status, setStatus] = useState<GoalStatus>("Active");
  const [fields, setFields] = useState<Record<string, string>>({});

  function hydrate() {
    setName(goal?.name ?? "");
    setWhy(goal?.why ?? "");
    setLifeArea(goal?.lifeArea ?? "");
    setTargetDate(goal?.targetDate || isoDate());
    setTargetValue(String(goal?.targetValue ?? 100));
    setCurrentValue(String(goal?.currentValue ?? 0));
    setNextAction(goal?.nextAction ?? "");
    setStatus(goal?.status ?? "Active");
    setFields({});
  }

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name,
        why,
        lifeArea,
        targetDate,
        targetValue: Number(targetValue),
        currentValue: Number(currentValue),
        nextAction,
        status,
      };
      return goal ? lifeOsApi.updateGoal(goal.id, payload) : lifeOsApi.createGoal(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Goal updated." : "Goal added.");
      qc.invalidateQueries({ queryKey: keys.goals });
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
          {isEdit ? "Edit goal" : "New goal"}
        </DialogTitle>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div>
            <Label htmlFor="goal-name">Name</Label>
            <Input
              id="goal-name"
              data-testid="goal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              autoComplete="off"
            />
            <FieldError message={fields.name} />
          </div>
          <div>
            <Label htmlFor="goal-why">Why</Label>
            <Textarea id="goal-why" value={why} onChange={(e) => setWhy(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="goal-current">Current</Label>
              <Input
                id="goal-current"
                data-testid="goal-current"
                inputMode="decimal"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
              />
              <FieldError message={fields.currentValue} />
            </div>
            <div>
              <Label htmlFor="goal-target">Target</Label>
              <Input
                id="goal-target"
                data-testid="goal-target"
                inputMode="decimal"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              />
              <FieldError message={fields.targetValue} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="goal-date">Target date</Label>
              <Input
                id="goal-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="goal-status">Status</Label>
              <NativeSelect
                id="goal-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as GoalStatus)}
              >
                <option>Active</option>
                <option>Paused</option>
                <option>Done</option>
              </NativeSelect>
            </div>
          </div>
          <div>
            <Label htmlFor="goal-area">Life area</Label>
            <NativeSelect
              id="goal-area"
              value={lifeArea}
              onChange={(e) => setLifeArea(e.target.value as LifeArea | "")}
            >
              <option value="">None</option>
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </NativeSelect>
          </div>
          <div>
            <Label htmlFor="goal-next">Next action</Label>
            <Input id="goal-next" value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" data-testid="goal-save" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Add goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
