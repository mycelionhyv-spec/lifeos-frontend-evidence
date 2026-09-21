import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { SquareLockup } from "@/components/brand/lockup";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", exact: true },
  { to: "/products", label: "Products" },
  { to: "/play", label: "Play" },
  { to: "/join", label: "Join" },
] as const;

function Links({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: "exact" in item }}
          onClick={onNavigate}
          data-testid={`public-nav-${item.label.toLowerCase()}`}
          className="flex h-11 items-center px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          activeProps={{ className: "flex h-11 items-center px-3 text-sm text-foreground" }}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="hive-wash min-h-dvh overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" className="flex min-h-11 items-center gap-2.5" aria-label="MyHYv Nexus home">
            <SquareLockup className="size-9" />
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              MyHYv
            </span>
            <span className="hidden text-xs font-medium tracking-widest text-gold uppercase sm:inline">
              Nexus
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary" data-testid="public-nav">
            <Links />
            <Button asChild size="sm" className="ml-3">
              <Link to="/app">Open LifeOS</Link>
            </Button>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <Button asChild size="sm">
              <Link to="/app">LifeOS</Link>
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                data-testid="public-menu"
                onClick={() => setOpen(true)}
              >
                <Menu />
              </Button>
              <SheetContent
                side="right"
                className="w-72 bg-background p-6 text-foreground"
                data-testid="public-sheet"
              >
                <p className="mb-4 font-display text-lg">MyHYv</p>
                <nav className="flex flex-col" aria-label="Mobile">
                  <Links onNavigate={() => setOpen(false)} />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className={cn("mx-auto max-w-6xl px-4 py-10", path === "/" && "py-0")}>{children}</main>
      <footer className="border-t border-border/80 px-4 py-8 text-sm text-muted-foreground">
        <div className="mx-auto max-w-6xl">
          <p>MyHYv / part of MyCelionHYv</p>
        </div>
      </footer>
    </div>
  );
}
