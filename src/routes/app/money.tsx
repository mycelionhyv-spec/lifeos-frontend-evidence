import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, NativeSelect } from "@/components/ui/input";
import { EmptyBlock, ErrorBlock, FieldError, LoadingBlock } from "@/components/lifeos/data-state";
import { MockApiError, lifeOsApi, type TxType } from "@/lib/api";
import { keys } from "@/lib/query";
import { formatMoney } from "@/lib/utils";

export const Route = createFileRoute("/app/money")({ component: MoneyPage });

function MoneyPage() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: keys.settings, queryFn: () => lifeOsApi.getSettings() });
  const txs = useQuery({ queryKey: keys.money, queryFn: () => lifeOsApi.listTransactions() });
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TxType>("Expense");
  const [fields, setFields] = useState<Record<string, string>>({});
  const currency = settings.data?.currency ?? "AUD";

  const add = useMutation({
    mutationFn: () =>
      lifeOsApi.createTransaction({
        description,
        amount: Number(amount),
        type,
        category: type === "Income" ? "Income" : "General",
      }),
    onSuccess: () => {
      toast.success("Logged.");
      qc.invalidateQueries({ queryKey: keys.money });
      qc.invalidateQueries({ queryKey: keys.today });
      setDescription("");
      setAmount("");
      setFields({});
    },
    onError: (err) => {
      if (err instanceof MockApiError && err.fields) setFields(err.fields);
      toast.error(err instanceof Error ? err.message : "Could not log.");
    },
  });

  const income = (txs.data ?? []).filter((t) => t.type === "Income").reduce((s, t) => s + t.amount, 0);
  const spend = (txs.data ?? []).filter((t) => t.type === "Expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="hidden text-xs font-medium tracking-widest text-gold uppercase lg:block">Money</p>
        <h1 className="mt-1 font-display text-4xl font-semibold">Ledger</h1>
      </header>
      {txs.isLoading && !txs.data ? <LoadingBlock /> : null}
      {txs.isError ? <ErrorBlock error={txs.error} onRetry={() => void txs.refetch()} /> : null}

      {!txs.isError ? (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Income</p>
              <p className="mt-1 font-display text-xl tabular-nums">{formatMoney(income, currency)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Spent</p>
              <p className="mt-1 font-display text-xl tabular-nums">{formatMoney(spend, currency)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="mt-1 font-display text-xl tabular-nums">
                {formatMoney(income - spend, currency)}
              </p>
            </Card>
          </section>

          <Card>
            <h2 className="font-display text-lg">Log a transaction</h2>
            <form
              className="mt-4 grid gap-3 sm:grid-cols-4"
              onSubmit={(e) => {
                e.preventDefault();
                add.mutate();
              }}
            >
              <div className="sm:col-span-2">
                <Label htmlFor="tx-desc">Description</Label>
                <Input id="tx-desc" data-testid="tx-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
                <FieldError message={fields.description} />
              </div>
              <div>
                <Label htmlFor="tx-amt">Amount</Label>
                <Input
                  id="tx-amt"
                  data-testid="tx-amt"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <FieldError message={fields.amount} />
              </div>
              <div>
                <Label htmlFor="tx-type">Type</Label>
                <NativeSelect
                  id="tx-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as TxType)}
                >
                  <option>Expense</option>
                  <option>Income</option>
                </NativeSelect>
              </div>
              <div className="sm:col-span-4">
                <Button type="submit" data-testid="log-transaction" disabled={add.isPending}>
                  {add.isPending ? "Saving…" : "Log transaction"}
                </Button>
              </div>
            </form>
          </Card>

          {txs.data?.length === 0 ? (
            <EmptyBlock title="No transactions." body="Log income or spend to see remaining capital." />
          ) : (
            <ul className="divide-y divide-border rounded-lg bg-card shadow-card">
              {(txs.data ?? []).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-sm">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.date} · {t.category || t.type}
                    </p>
                  </div>
                  <p
                    className={
                      t.type === "Income"
                        ? "font-mono text-sm text-success tabular-nums"
                        : "font-mono text-sm tabular-nums"
                    }
                  >
                    {t.type === "Income" ? "+" : "−"}
                    {formatMoney(t.amount, currency)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </div>
  );
}
