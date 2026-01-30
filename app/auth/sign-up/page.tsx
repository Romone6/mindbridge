"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

type AuthErrorContext = { error: { message: string } };

function SignUpContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
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
      const { error: signUpError } = await withTimeout(
        authClient.signUp.email(
          {
            email,
            password,
            name,
            callbackURL: redirectTo,
          },
          {
            onError(ctx: AuthErrorContext) {
              setError(ctx.error.message ?? "Sign up failed.");
            },
            onSuccess() {
              window.location.href = `/auth/verify-email?redirect=${encodeURIComponent(redirectTo)}`;
            },
          }
        ),
        15000
      );

      if (signUpError) {
        setError(signUpError.message ?? "Sign up failed.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-lg px-6 py-20">
      <Panel className="p-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Start with secure access to MindBridge.
          </p>
        </header>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Jane Smith"
              required
              autoComplete="name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@clinic.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link
            href={`/auth/sign-in?redirect=${encodeURIComponent(redirectTo)}`}
            className="underline"
          >
            Sign in
          </Link>
        </p>
      </Panel>
    </section>
  );
}

export default function SignUpPage() {
  return (
    <MainLayout showFooter={false}>
      <Suspense fallback={
        <section className="mx-auto w-full max-w-lg px-6 py-20">
          <Panel className="p-8 text-sm text-muted-foreground">Loading sign-up…</Panel>
        </section>
      }>
        <SignUpContent />
      </Suspense>
    </MainLayout>
  );
}
