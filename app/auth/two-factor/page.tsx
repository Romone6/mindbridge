"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

export default function TwoFactorPage() {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: verifyError } = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: true,
      });

      if (verifyError) {
        setError(verifyError.message ?? "Verification failed.");
        return;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout showFooter={false}>
      <section className="mx-auto w-full max-w-lg px-6 py-20">
        <Panel className="p-8 space-y-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-bold">Two-factor verification</h1>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code from your authenticator app.
            </p>
          </header>

          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
            />

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
          </form>
        </Panel>
      </section>
    </MainLayout>
  );
}
