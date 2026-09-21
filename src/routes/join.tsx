import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { FieldError } from "@/components/lifeos/data-state";

export const Route = createFileRoute("/join")({ component: Join });

function Join() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!email.trim() || !email.includes("@")) next.email = "Enter a valid email.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const payload = {
      name: name.trim(),
      email: email.trim(),
      note: note.trim(),
      at: new Date().toISOString(),
    };
    const prev = JSON.parse(localStorage.getItem("lifeos.join.requests") || "[]") as unknown[];
    localStorage.setItem("lifeos.join.requests", JSON.stringify([payload, ...prev]));
    setSaved(true);
    toast.success("Request stored on this device only.");
  }

  return (
    <PublicShell>
      <p className="text-xs font-medium tracking-widest text-gold uppercase">Join</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">Request access.</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        This form does not create an account. It does not sign you in. It stores a request on
        this device so Astra can inspect the entry surface. Authentication is owned by Astra
        and is not implemented here.
      </p>
      {saved ? (
        <p className="mt-8 rounded-lg bg-card p-5 text-sm shadow-card" role="status">
          Request saved locally. Nothing was sent to a server.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-8 max-w-md space-y-4" noValidate>
          <div>
            <Label htmlFor="join-name">Name</Label>
            <Input id="join-name" value={name} onChange={(e) => setName(e.target.value)} />
            <FieldError message={errors.name} />
          </div>
          <div>
            <Label htmlFor="join-email">Email</Label>
            <Input
              id="join-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <FieldError message={errors.email} />
          </div>
          <div>
            <Label htmlFor="join-note">Why you want in</Label>
            <Textarea id="join-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button type="submit">Save request on this device</Button>
        </form>
      )}
    </PublicShell>
  );
}
