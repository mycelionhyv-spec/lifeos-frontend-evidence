import { useState, type ReactNode } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  CheckSquare,
  Flag,
  HeartPulse,
  LayoutDashboard,
  Menu,
  ScanText,
  Settings,
  Wallet,
} from "lucide-react";
import { AppMark } from "@/components/brand/lockup";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/app", label: "Today", icon: LayoutDashboard, exact: true },
  { to: "/app/capture", label: "Capture", icon: ScanText },
  { to: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/app/goals", label: "Goals", icon: Flag },
  { to: "/app/money", label: "Money", icon: Wallet },
  { to: "/app/health", label: "Health", icon: HeartPulse },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="LifeOS" data-testid="lifeos-nav">
      {NAV.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: "exact" in item }}
            onClick={onNavigate}
            data-testid={`nav-${item.label.toLowerCase()}`}
            className="flex h-11 items-center gap-3 rounded-md border-l-2 border-transparent px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            activeProps={{
              className:
                "flex h-11 items-center gap-3 rounded-md border-l-2 border-gold bg-muted px-3 text-sm text-foreground",
            }}
          >
            <Icon className="size-4 shrink-0" strokeWidth={1.6} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const copy = useRouterState({
    select: (s) => {
      const hit = NAV.find((n) =>
        n.to === "/app" ? s.location.pathname === "/app" : s.location.pathname.startsWith(n.to),
      );
      return hit?.label ?? "Today";
    },
  });

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card lg:flex">
        <div className="px-5 py-6">
          <Link to="/" aria-label="Back to MyHYv home">
            <AppMark />
          </Link>
        </div>
        <NavList />
        <p className="px-5 py-4 text-xs text-muted-foreground">Synthetic data. Mock API.</p>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-sm lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open LifeOS menu"
              data-testid="app-menu"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </Button>
            <SheetContent side="left" className="w-72 bg-card p-0 text-foreground" data-testid="app-sheet">
              <div className="px-5 py-6">
                <AppMark />
              </div>
              <NavList onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <p className="font-display text-lg">{copy}</p>
        </header>
        <main className={cn("px-4 py-6 sm:px-6 lg:px-8 lg:py-8")}>{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
