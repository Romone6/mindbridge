"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

type AuthErrorContext = { error: { message: string } };

const TEAM_DOMAIN = "@mindbridge.health";

function SignInContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Detect if email is a MindBridge team member (passwordless access)
  const isTeamEmail = useMemo(() => {
    return email.toLowerCase().trim().endsWith(TEAM_DOMAIN);
  }, [email]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const withTimeout = async <T,>(promise: Promise<T>, ms: number) => {
      let t: ReturnType<typeof setTimeout> | null = null;
      const timeout = new Promise<never>((_, reject) => {
        t = setTimeout(() => reject(new Error("Request timed out.")), ms);
      });
      try {
        return await Promise.race([promise, timeout]);
      } finally {
        if (t) clearTimeout(t);
      }
    };

    try {
      // Team members use magic link (passwordless)
      if (isTeamEmail) {
        await withTimeout(handleTeamSignIn(), 15000);
        return;
      }

      const { data, error: signInError } = await withTimeout(
        authClient.signIn.email(
          {
            email,
            password,
            callbackURL: redirectTo,
            rememberMe: true,
          },
          {
            onError(ctx: AuthErrorContext) {
              setError(ctx.error.message ?? "Sign in failed.");
            },
          }
        ),
        15000
      );

      if (signInError) {
        setError(signInError.message ?? "Sign in failed.");
      }

      const twoFactorRedirect = (data as { twoFactorRedirect?: boolean } | undefined)
        ?.twoFactorRedirect;
      if (twoFactorRedirect) {
        window.location.href = "/auth/two-factor";
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeamSignIn = async () => {
    if (!email) {
      setError("Enter your @mindbridge.health email.");
      return;
    }

    setError(null);
    setMagicLinkSent(false);

    const { error: magicError } = await authClient.signIn.magicLink({
      email,
      callbackURL: redirectTo,
      errorCallbackURL: `/auth/sign-in?redirect=${encodeURIComponent(redirectTo)}`,
    });

    if (magicError) {
      setError(magicError.message ?? "Failed to send sign-in link.");
    } else {
      setMagicLinkSent(true);
    }

  };

  const handlePasskeySignIn = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { error: passkeyError } = await authClient.signIn.passkey({
        autoFill: true,
        fetchOptions: {
          onSuccess() {
            window.location.href = redirectTo;
          },
          onError(context: AuthErrorContext) {
            setError(context.error.message);
          },
        },
      });

      if (passkeyError) {
        setError(passkeyError.message ?? "Passkey sign-in failed.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Passkey sign-in failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError("Enter your email to receive a magic link.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setMagicLinkSent(false);

    try {
      const { error: magicError } = await authClient.signIn.magicLink({
        email,
        callbackURL: redirectTo,
        errorCallbackURL: `/auth/sign-in?redirect=${encodeURIComponent(redirectTo)}`,
      });

      if (magicError) {
        setError(magicError.message ?? "Failed to send magic link.");
      } else {
        setMagicLinkSent(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send magic link.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-lg px-6 py-20">
      <Panel className="p-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Access your clinical workspace.
          </p>
        </header>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@clinic.com"
              required
              autoComplete="email webauthn"
            />
            {isTeamEmail && (
              <p className="text-xs text-emerald-600">
                MindBridge team detected. No password required.
              </p>
            )}
          </div>

          {!isTeamEmail && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password webauthn"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {magicLinkSent && isTeamEmail && (
            <p className="text-sm text-emerald-600 text-center">
              Sign-in link sent to your MindBridge email. Check your inbox.
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? "Signing in..."
              : isTeamEmail
                ? "Send sign-in link"
                : "Sign in"}
          </Button>
        </form>

        {!isTeamEmail && (
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleMagicLink}
              disabled={isSubmitting}
            >
              Email me a magic link
            </Button>
            {magicLinkSent && (
              <p className="text-sm text-emerald-600 text-center">
                Magic link sent. Check your inbox.
              </p>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={handlePasskeySignIn}
              disabled={isSubmitting}
            >
              Sign in with passkey
            </Button>
          </div>
        )}

        {isTeamEmail && (
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handlePasskeySignIn}
              disabled={isSubmitting}
            >
              Sign in with passkey
            </Button>
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center">
          Need an account?{" "}
          <Link
            href={`/auth/sign-up?redirect=${encodeURIComponent(redirectTo)}`}
            className="underline"
          >
            Create one
          </Link>
        </p>
      </Panel>
    </section>
  );
}

export default function SignInPage() {
  return (
    <MainLayout showFooter={false}>
      <Suspense fallback={
        <section className="mx-auto w-full max-w-lg px-6 py-20">
          <Panel className="p-8 text-sm text-muted-foreground">Loading sign-in…</Panel>
        </section>
      }>
        <SignInContent />
      </Suspense>
    </MainLayout>
  );
}
