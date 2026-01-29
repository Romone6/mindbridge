import { MainLayout } from "@/components/layout/main-layout";

export const metadata = {
  title: "AI Triage vs Manual Intake | MindBridge Comparison",
  description:
    "Compare AI triage with manual intake across speed, safety, and scalability for mental health services.",
};

export default function AiTriageVsManualPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI Triage vs Manual Intake",
    description:
      "Comparison of AI triage and manual intake for behavioral health operations.",
    url: "https://mindbridge.health/compare/ai-triage-vs-manual",
  };

  return (
    <MainLayout>
      <section className="mx-auto w-full max-w-5xl px-6 py-16 space-y-10">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            AI Triage vs Manual Intake
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            A practical comparison of speed, consistency, and risk handling for
            behavioral health programs.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">AI Triage</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Structured intake in minutes, not days.</li>
              <li>Consistent risk scoring across cohorts.</li>
              <li>Automated summaries reduce clinician burden.</li>
              <li>Escalation rules enforce safety thresholds.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Manual Intake</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Highly dependent on staff availability.</li>
              <li>Variable assessment quality under pressure.</li>
              <li>Longer time-to-care for urgent cases.</li>
              <li>Limited ability to scale with demand.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-6">
          <h3 className="text-lg font-semibold">Recommendation</h3>
          <p className="text-sm text-muted-foreground mt-2">
            AI triage improves speed and consistency while maintaining clinician
            oversight. Manual intake remains essential for high-acuity or complex
            presentations, but can be reserved for escalations.
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
