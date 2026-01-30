"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AccessClient() {
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    if (!next) return "/auth/sign-in";
    if (!next.startsWith("/")) return "/auth/sign-in";
    return next;
  }, [searchParams]);

  const stripeSessionId = searchParams.get("stripe_session_id") || "";

  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grantAccess = useCallback(async () => {
    const res = await fetch("/api/portal-access/grant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code: code || undefined,
        email: email || undefined,
        stripeSessionId: stripeSessionId || undefined,
      }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as
        | { error?: string }
        | null;
      throw new Error(body?.error || "Access denied.");
    }
  }, [code, email, stripeSessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await grantAccess();

      window.location.href = nextPath;
    } catch {
      setError("Could not verify access. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!stripeSessionId) return;
    if (isSubmitting) return;

    let cancelled = false;
    setIsSubmitting(true);
    setError(null);
    grantAccess()
      .then(() => {
        if (!cancelled) window.location.href = nextPath;
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Access denied.";
        if (!cancelled) setError(message);
      })
      .finally(() => {
        if (!cancelled) setIsSubmitting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [grantAccess, isSubmitting, nextPath, stripeSessionId]);

  return (
    <section className="mx-auto w-full max-w-lg px-6 py-20">
      <Panel className="p-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">Clinician portal access</h1>
          <p className="text-sm text-muted-foreground">
            Enter your access code to continue to the sign-in portal.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!stripeSessionId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Work email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.com"
                autoComplete="email"
              />
              <p className="text-xs text-muted-foreground">
                If your organisation is already provisioned, we will unlock access automatically.
              </p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Access code</label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="XXXX-XXXX"
              autoComplete="one-time-code"
              required={!stripeSessionId && !email}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Continue"}
          </Button>
        </form>
      </Panel>
    </section>
  );
}
