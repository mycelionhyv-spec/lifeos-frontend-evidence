import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      <circle cx="6" cy="24" r="1.8" fill="currentColor" />
      <circle cx="16" cy="6" r="1.8" fill="currentColor" />
      <circle cx="26" cy="24" r="1.8" fill="currentColor" />
      <path
        d="M6 24 L16 6 L26 24"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M11.2 14.6 H20.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-gold">
        <Mark className="size-7" />
      </span>
      <div className="min-w-0 leading-none">
        <div className="font-display text-xl font-medium tracking-tight text-sidebar-primary">
          MyHYV
        </div>
        {!compact ? (
          <div className="mt-1 text-xs font-medium tracking-widest text-gold uppercase">
            LifeOS
          </div>
        ) : null}
      </div>
    </div>
  );
}
