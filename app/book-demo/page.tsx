import Link from "next/link";

import { MainLayout } from "@/components/layout/main-layout";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { BookDemoForm } from "@/components/booking/book-demo-form";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Book a Demo | MindBridge",
  description: "Schedule a MindBridge walkthrough and get tailored intake workflow guidance.",
};

type SearchParams = {
  preview?: string;
};

export default async function BookDemoPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const schedulingUrl = process.env.NEXT_PUBLIC_SCHEDULING_URL ?? "";
  const shouldFallback = resolvedSearchParams?.preview === "missing";
  const resolvedUrl = shouldFallback ? "" : schedulingUrl;

  return (
    <MainLayout>
      <div className="space-y-10">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
            Demo scheduling
          </div>
          <h1>Book a MindBridge demo</h1>
          <p className="text-lg text-muted-foreground">
            Meet with our team to walk through the clinical intake workflow and see how MindBridge fits your clinic.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <BookDemoForm />

          <Panel className="p-6 md:p-8">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Schedule a walkthrough</h2>
                <p className="text-sm text-muted-foreground">
                  Pick a time that works for you. If the scheduler isn&apos;t available, we&apos;ll connect by email.
                </p>
              </div>

              {resolvedUrl ? (
                <div
                  className="relative w-full min-h-[560px] md:min-h-[640px] overflow-hidden rounded-[var(--radius)] border border-border"
                  data-testid="scheduling-iframe"
                >
                  <iframe
                    title="Schedule a demo"
                    src={resolvedUrl}
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div
                  className="space-y-4 rounded-[var(--radius)] border border-border bg-muted/20 p-6 text-sm"
                  data-testid="scheduling-fallback"
                >
                  <p className="text-muted-foreground">
                    Scheduling is not configured yet. Email our team and we&apos;ll coordinate a demo time.
                  </p>
                  <Button asChild variant="outline">
                    <a href={`mailto:${siteConfig.contactEmails.sales}`}>Email sales</a>
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    Prefer browsing first? Visit the{" "}
                    <Link href="/demo" className="underline underline-offset-4 hover:text-foreground">
                      interactive demo
                    </Link>
                    .
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </MainLayout>
  );
}
