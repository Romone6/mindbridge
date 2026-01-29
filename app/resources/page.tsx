import { MainLayout } from "@/components/layout/main-layout";

export const metadata = {
  title: "Mental Health Resources & Glossary | MindBridge",
  description:
    "Glossary and resources for AI triage, behavioral health operations, and clinical safety.",
};

const glossary = [
  {
    term: "AI Triage",
    definition:
      "A decision support workflow that helps prioritize patients based on risk and clinical urgency.",
  },
  {
    term: "Risk Stratification",
    definition:
      "The process of assigning patients to risk tiers to guide escalation and follow-up timing.",
  },
  {
    term: "Escalation Protocol",
    definition:
      "A defined pathway for urgent cases that require immediate clinician review.",
  },
  {
    term: "Clinical Guardrail",
    definition:
      "Safety constraints that ensure AI recommendations remain within approved clinical boundaries.",
  },
  {
    term: "Time-to-First-Touch",
    definition:
      "The time from patient intake to their first clinical interaction.",
  },
  {
    term: "Crisis Indicators",
    definition:
      "Signals that suggest immediate safety risks such as self-harm intent or acute distress.",
  },
];

const resources = [
  {
    title: "AI Triage Implementation Checklist",
    description:
      "Operational steps for launching AI triage in a clinical setting.",
  },
  {
    title: "Escalation Workflow Template",
    description:
      "Define thresholds, on-call coverage, and response SLAs.",
  },
  {
    title: "Clinical Metrics Dashboard Guide",
    description:
      "Track triage KPIs including time-to-care and escalation response time.",
  },
];

export default function ResourcesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "MindBridge Resources",
    description:
      "Glossary and resources for AI triage, behavioral health operations, and clinical safety.",
    url: "https://mindbridge.health/resources",
  };

  return (
    <MainLayout>
      <section className="mx-auto w-full max-w-5xl px-6 py-16 space-y-12">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Resources & Glossary
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Clear definitions and operational guidance for teams implementing AI
            triage in behavioral health programs.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Glossary</h2>
            <div className="space-y-3">
              {glossary.map((item) => (
                <div
                  key={item.term}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <p className="font-semibold">{item.term}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Resources</h2>
            <div className="space-y-3">
              {resources.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </section>
    </MainLayout>
  );
}
