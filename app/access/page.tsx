import { MainLayout } from "@/components/layout/main-layout";
import AccessClient from "./access-client";
import { Suspense } from "react";

export default function AccessPage() {
  return (
    <MainLayout showFooter={false}>
      <Suspense
        fallback={
          <section className="mx-auto w-full max-w-lg px-6 py-20">
            <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
              Loading access…
            </div>
          </section>
        }
      >
        <AccessClient />
      </Suspense>
    </MainLayout>
  );
}
