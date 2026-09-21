import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, Label, NativeSelect } from "@/components/ui/input";
import { ErrorBlock, LoadingBlock } from "@/components/lifeos/data-state";
import { lifeOsApi } from "@/lib/api";
import { keys } from "@/lib/query";

export const Route = createFileRoute("/app/settings")({ component: SettingsPage });

function SettingsPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: keys.settings, queryFn: () => lifeOsApi.getSettings() });
  const save = useMutation({
    mutationFn: (patch: Parameters<typeof lifeOsApi.updateSettings>[0]) =>
      lifeOsApi.updateSettings(patch),
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Saved.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });
  const reset = useMutation({
    mutationFn: (mode: "seed" | "empty") => lifeOsApi.reset(mode),
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Data reset.");
    },
  });

  const s = q.data;

  return (
    <div className="space-y-6">
      <header>
        <p className="hidden text-xs font-medium tracking-widest text-gold uppercase lg:block">Settings</p>
        <h1 className="mt-1 font-display text-4xl font-semibold">Tune the OS</h1>
      </header>
      {q.isLoading ? <LoadingBlock /> : null}
      {q.isError ? <ErrorBlock error={q.error} onRetry={() => void q.refetch()} /> : null}
      {s ? (
        <>
          <Card className="max-w-lg space-y-4">
            <div>
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                defaultValue={s.userName}
                onBlur={(e) => save.mutate({ userName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <NativeSelect
                id="currency"
                defaultValue={s.currency}
                onChange={(e) => save.mutate({ currency: e.target.value })}
              >
                <option value="AUD">AUD</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </NativeSelect>
            </div>
            <div>
              <Label htmlFor="tz">Timezone</Label>
              <Input id="tz" defaultValue={s.timezone} readOnly />
              <p className="mt-1 text-xs text-muted-foreground">Locked to the seed (Australia/Perth).</p>
            </div>
            <label className="flex items-center gap-3 text-sm">
              <Checkbox
                checked={s.simulateFailure}
                onCheckedChange={(v) => save.mutate({ simulateFailure: v === true })}
                aria-label="Simulate API failure"
                data-testid="simulate-failure"
              />
              Simulate API failure (QA control)
            </label>
          </Card>
          <Card className="max-w-lg space-y-3">
            <p className="text-sm text-muted-foreground">
              Reset local mock data. Does not touch any Google Sheet.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" data-testid="reset-seed" onClick={() => reset.mutate("seed")}>
                Reload seed
              </Button>
              <Button variant="ghost" data-testid="reset-empty" onClick={() => reset.mutate("empty")}>
                Empty board
              </Button>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
