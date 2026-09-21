import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/play")({ component: Play });

function Play() {
  return (
    <PublicShell>
      <p className="text-xs font-medium tracking-widest text-gold uppercase">Play</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">Magnets, not the OS.</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Play is for optional demonstrations. LifeOS is the product. Signal Path is not rebuilt
        in this package — the card is honest about that.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-xs tracking-widest text-muted-foreground uppercase">01 · local only</p>
          <h2 className="mt-2 font-display text-2xl">Signal Path</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Three quiet routing puzzles existed on the previous habitat site. This evidence
            package does not include that game. Astra may keep the old Play surface or drop it.
          </p>
          <p className="mt-4 text-sm text-destructive">NOT BUILT in this reference.</p>
        </Card>
        <Card>
          <p className="text-xs tracking-widest text-muted-foreground uppercase">02 · the product</p>
          <h2 className="mt-2 font-display text-2xl">LifeOS</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The operating picture. Tasks, money, health. Synthetic data through a mock adapter.
          </p>
          <Button asChild className="mt-6">
            <Link to="/app">Open LifeOS</Link>
          </Button>
        </Card>
      </div>
    </PublicShell>
  );
}
