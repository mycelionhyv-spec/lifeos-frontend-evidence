import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MockApiError } from "@/lib/api";

export function LoadingBlock({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="space-y-3"
      role="status"
      aria-live="polite"
      aria-label={label}
      data-testid="loading-block"
    >
      <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
      <div className="h-24 animate-pulse rounded-lg bg-muted" />
      <div className="h-24 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

export function EmptyBlock({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="rounded-lg border border-dashed border-border bg-card px-5 py-10 text-center"
      data-testid="empty-block"
    >
      <p className="font-display text-lg text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorBlock({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const message =
    error instanceof MockApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Something failed. Try again.";
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/30 bg-card px-5 py-6 text-foreground"
      data-testid="error-block"
    >
      <p className="flex items-center gap-2 text-sm font-medium text-destructive">
        <AlertCircle className="size-4" />
        Request failed
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-destructive" role="alert" data-testid="field-error">
      {message}
    </p>
  );
}
