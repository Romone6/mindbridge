"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  return (
    <section className="mx-auto w-full max-w-lg px-6 py-20">
      <Panel className="p-8 space-y-6 text-center">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to your email address. Open the link to
          activate your account and continue.
        </p>
        <Button asChild>
          <Link href={`/auth/sign-in?redirect=${encodeURIComponent(redirectTo)}`}>
            Back to sign in
          </Link>
        </Button>
      </Panel>
    </section>
  );
}

export default function VerifyEmailPage() {
  return (
    <MainLayout showFooter={false}>
      <Suspense fallback={
        <section className="mx-auto w-full max-w-lg px-6 py-20">
          <Panel className="p-8 text-sm text-muted-foreground text-center">Loading verification…</Panel>
        </section>
      }>
        <VerifyEmailContent />
      </Suspense>
    </MainLayout>
  );
}
