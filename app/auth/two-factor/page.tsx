"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

type SetupData = {
  totpURI: string;
  secret?: string;
  backupCodes?: string[];
};

export default function TwoFactorPage() {
  const searchParams = useSearchParams();
  const isSetupMode = searchParams.get("setup") === "1";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: enableError } = await authClient.twoFactor.enable({
        password,
      });

      if (enableError) {
        setError(enableError.message ?? "Failed to start 2FA setup.");
        return;
      }

      if (!data?.totpURI) {
        setError("Failed to load authenticator setup details.");
        return;
      }

      setSetupData({
        totpURI: data.totpURI,
        secret: data.secret,
        backupCodes: data.backupCodes,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start 2FA setup.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      window.location.href = isSetupMode ? "/dashboard/settings" : "/dashboard";
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
            <h1 className="text-2xl font-bold">
              {isSetupMode ? "Set up two-factor authentication" : "Two-factor verification"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSetupMode
                ? "Create your authenticator setup, then verify with a 6-digit code."
                : "Enter the 6-digit code from your authenticator app."}
            </p>
          </header>

          {isSetupMode && !setupData ? (
            <form onSubmit={handleStartSetup} className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Confirm your account password"
                autoComplete="current-password"
                required
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Preparing setup..." : "Generate setup details"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              {isSetupMode && setupData && (
                <div className="space-y-3 rounded-md border p-4 text-sm">
                  <p className="font-medium">Authenticator setup key</p>
                  {setupData.secret && (
                    <p className="break-all text-muted-foreground">{setupData.secret}</p>
                  )}
                  <p className="font-medium">TOTP URI</p>
                  <p className="break-all text-muted-foreground">{setupData.totpURI}</p>
                  {setupData.backupCodes && setupData.backupCodes.length > 0 && (
                    <div className="space-y-1">
                      <p className="font-medium">Backup codes</p>
                      <ul className="list-disc pl-5 text-muted-foreground">
                        {setupData.backupCodes.map((backupCode) => (
                          <li key={backupCode}>{backupCode}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : isSetupMode ? "Verify and enable 2FA" : "Verify"}
              </Button>
            </form>
          )}
        </Panel>
      </section>
    </MainLayout>
  );
}
