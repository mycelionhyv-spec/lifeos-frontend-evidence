import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <PublicShell>
      <section className="grid min-h-[calc(100dvh-4rem)] items-center gap-10 py-12 lg:grid-cols-2">
        <div className="rise-in">
          <p className="text-xs font-medium tracking-widest text-gold uppercase">
            MyCelionHYv / MyHYv Nexus
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Evolve your potential.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            LifeOS is the personal operating system inside MyHYv Nexus. Capture, organise,
            act — tasks, money, health, and goals in one quiet surface.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/app">
                Open LifeOS
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href="/lifeos-frontend-evidence.zip" download="lifeos-frontend-evidence.zip">
                Download Round Two pack
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/join">Request access</Link>
            </Button>
          </div>
          <p className="mt-6 max-w-md text-xs text-muted-foreground">
            Transferable frontend reference. Data is synthetic. There is no live account system
            in this build.
          </p>
        </div>
        <div className="rise-in overflow-hidden rounded-xl bg-ink shadow-card">
          <img
            src="/brand/logo-square.png"
            alt="Approved MyHYv Nexus LifeOS mark"
            className="aspect-square w-full object-cover"
          />
        </div>
      </section>
    </PublicShell>
  );
}
