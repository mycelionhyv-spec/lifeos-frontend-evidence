import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function WideLockup({ className }: { className?: string }) {
  return (
    <img
      src="/brand/logo-wide.png"
      alt="MyHYv Nexus LifeOS"
      className={cn("h-10 w-auto max-w-[220px] object-contain object-left", className)}
    />
  );
}

export function SquareLockup({ className }: { className?: string }) {
  return (
    <img
      src="/brand/logo-square.png"
      alt="MyHYv Nexus LifeOS"
      className={cn("size-12 rounded-md object-cover", className)}
    />
  );
}

export function Wordmark({ to = "/", compact = false }: { to?: string; compact?: boolean }) {
  return (
    <Link to={to} className="flex min-h-11 items-center gap-2.5">
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        MyHYv
      </span>
      {!compact ? (
        <span className="text-xs font-medium tracking-widest text-gold uppercase">Nexus</span>
      ) : null}
    </Link>
  );
}

export function AppMark() {
  return (
    <div className="flex items-center gap-3">
      <SquareLockup className="size-10" />
      <div className="leading-tight">
        <p className="font-display text-base font-semibold text-foreground">LifeOS</p>
        <p className="text-xs tracking-wide text-muted-foreground">MyHYv Nexus</p>
      </div>
    </div>
  );
}
