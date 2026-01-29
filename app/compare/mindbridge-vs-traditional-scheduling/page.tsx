import { MainLayout } from "@/components/layout/main-layout";

export const metadata = {
  title: "MindBridge vs Traditional Scheduling | Comparison",
  description:
    "Compare MindBridge AI triage with traditional scheduling workflows for mental health access and safety.",
};

export default function MindBridgeVsTraditionalPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "MindBridge vs Traditional Scheduling",
    description:
      "Comparison of AI-assisted triage workflows and traditional scheduling models.",
    url: "https://mindbridge.health/compare/mindbridge-vs-traditional-scheduling",
  };

  return (
    <MainLayout>
      <section className="mx-auto w-full max-w-5xl px-6 py-16 space-y-10">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            MindBridge vs Traditional Scheduling
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            See how AI-first triage creates faster access and safer escalation
            compared to legacy scheduling models.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">MindBridge</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Real-time triage with risk stratification.</li>
              <li>Escalation alerts routed to on-call teams.</li>
              <li>Automated intake summaries for clinicians.</li>
              <li>Faster time-to-care for high-risk patients.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Traditional Scheduling</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Queue-based intake with limited prioritization.</li>
              <li>Manual escalation reliant on staff availability.</li>
              <li>Documentation overhead for every intake.</li>
              <li>Longer wait times for urgent care.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-6">
          <h3 className="text-lg font-semibold">Outcome</h3>
          <p className="text-sm text-muted-foreground mt-2">
            AI triage augments existing scheduling by identifying risk early and
            accelerating care access. Traditional models can be layered on top
            for long-term follow-ups.
          </p>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </section>
    </MainLayout>
  );
}
