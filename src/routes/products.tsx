import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/products")({ component: Products });

const ITEMS = [
  {
    code: "01",
    status: "Available",
    title: "LifeOS",
    body: "Today, tasks, goals, money and health. Mock API, synthetic data, replaceable adapter.",
    to: "/app",
    cta: "Open LifeOS",
  },
  {
    code: "02",
    status: "Demonstration",
    title: "Signal Path",
    body: "A quiet routing puzzle. Fictional game state. Not the operating system.",
    to: "/play",
    cta: "Play",
  },
  {
    code: "03",
    status: "Later",
    title: "Vacate Ready",
    body: "Australian renter kits. Separate SKU. Not wired in this reference.",
    to: "/join",
    cta: "Join list",
  },
] as const;

function Products() {
  return (
    <PublicShell>
      <p className="text-xs font-medium tracking-widest text-gold uppercase">
        Products / small things, made real
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold">Explore what works.</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Tools inside this private prototype. No purchases, paid unlocks or checkout.
      </p>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {ITEMS.map((item) => (
          <li key={item.code} className="flex flex-col rounded-lg bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <Badge variant="gold">{item.status}</Badge>
              <span className="font-mono text-xs text-muted-foreground">{item.code}</span>
            </div>
            <h2 className="mt-4 font-display text-2xl">{item.title}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{item.body}</p>
            <Button asChild variant="ghost" className="mt-6 justify-start px-0 text-gold">
              <Link to={item.to}>{item.cta} →</Link>
            </Button>
          </li>
        ))}
      </ul>
    </PublicShell>
  );
}
