import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  LayoutDashboard,
  ShieldAlert,
} from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

export type WorkspacePreviewRole = "clinician" | "admin";

type PreviewNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type PreviewStat = {
  label: string;
  value: string;
  description: string;
};

type PreviewItem = {
  label: string;
  value: string;
  tag?: string;
  tagVariant?: BadgeProps["variant"];
};

type PreviewSection = {
  id: string;
  title: string;
  description: string;
  items: PreviewItem[];
  note?: string;
};

type PreviewContent = {
  heading: string;
  description: string;
  workspaceTitle: string;
  workspaceSubtitle: string;
  navItems: PreviewNavItem[];
  stats: PreviewStat[];
  sections: PreviewSection[];
};

const previewNavItems: PreviewNavItem[] = [
  { label: "Overview", href: "#overview", icon: LayoutDashboard },
  { label: "Intake summary", href: "#intake-summary", icon: FileText },
  { label: "Risk review", href: "#risk-review", icon: ShieldAlert },
  { label: "Escalation queue", href: "#escalation-queue", icon: AlertTriangle },
];

const previewContent: Record<WorkspacePreviewRole, PreviewContent> = {
  clinician: {
    heading: "Clinician workspace preview",
    description:
      "Review structured intake summaries and risk signals before deciding escalation steps. Every panel below is sample data only.",
    workspaceTitle: "Harborview Clinic",
    workspaceSubtitle: "Sample data only. Not real patient information.",
    navItems: previewNavItems,
    stats: [
      {
        label: "Queue focus",
        value: "Sample only",
        description: "Preview of clinician triage view.",
      },
      {
        label: "Risk signals",
        value: "Sample only",
        description: "No live patient data or metrics.",
      },
      {
        label: "Next steps",
        value: "Sample only",
        description: "Escalation routing preview.",
      },
    ],
    sections: [
      {
        id: "intake-summary",
        title: "Intake summary",
        description: "Snapshot of a recent intake ready for clinician review.",
        items: [
          {
            label: "Case identifier",
            value: "Case 1042 (Sample)",
          },
          {
            label: "Primary concern",
            value: "Anxiety and sleep disruption",
          },
          {
            label: "Context tags",
            value: "Work stress, insomnia",
          },
          {
            label: "Next step",
            value: "Clinician review queued",
          },
        ],
        note: "Sample summary cards show how intake context is structured without exposing real patient data.",
      },
      {
        id: "risk-review",
        title: "Risk review",
        description: "Clinician-facing risk checks with clear severity cues.",
        items: [
          {
            label: "Suicidality screening",
            value: "Requires clinician check",
            tag: "High",
            tagVariant: "riskHigh",
          },
          {
            label: "Medication adherence",
            value: "Needs clarification",
            tag: "Moderate",
            tagVariant: "riskModerate",
          },
          {
            label: "Substance use",
            value: "Not indicated",
            tag: "Low",
            tagVariant: "riskLow",
          },
          {
            label: "Protective factors",
            value: "Family support noted",
            tag: "Low",
            tagVariant: "riskLow",
          },
        ],
      },
      {
        id: "escalation-queue",
        title: "Escalation queue",
        description: "Upcoming clinician actions and follow-ups.",
        items: [
          {
            label: "Case 1042",
            value: "Safety check pending",
            tag: "Urgent",
            tagVariant: "riskHigh",
          },
          {
            label: "Case 1038",
            value: "Follow-up scheduling",
            tag: "Review",
            tagVariant: "riskModerate",
          },
          {
            label: "Case 1024",
            value: "Routine review",
            tag: "Normal",
            tagVariant: "riskLow",
          },
          {
            label: "Case 1019",
            value: "Review consent status",
            tag: "Review",
            tagVariant: "riskModerate",
          },
        ],
      },
    ],
  },
  admin: {
    heading: "Clinic admin workspace preview",
    description:
      "Monitor intake operations, coverage readiness, and escalation flow from an admin perspective. Every panel below is sample data only.",
    workspaceTitle: "Harborview Clinic",
    workspaceSubtitle: "Sample data only. Not real patient information.",
    navItems: previewNavItems,
    stats: [
      {
        label: "Workflow status",
        value: "Sample only",
        description: "Configuration preview for admins.",
      },
      {
        label: "Coverage readiness",
        value: "Sample only",
        description: "No live staffing metrics shown.",
      },
      {
        label: "Audit checks",
        value: "Sample only",
        description: "Preview of compliance dashboard.",
      },
    ],
    sections: [
      {
        id: "intake-summary",
        title: "Intake summary",
        description: "Configuration view of intake content and routing rules.",
        items: [
          {
            label: "Intake template",
            value: "Standard intake v3 (Sample)",
          },
          {
            label: "Required fields",
            value: "Safety, consent, history",
          },
          {
            label: "Routing rule",
            value: "Clinician pool A",
          },
          {
            label: "Consent capture",
            value: "Included in workflow",
          },
        ],
        note: "Sample workflow configuration shown for preview only.",
      },
      {
        id: "risk-review",
        title: "Risk review",
        description: "Operational view of escalation policies and safeguards.",
        items: [
          {
            label: "Escalation policy",
            value: "Active (Sample)",
            tag: "Review",
            tagVariant: "riskModerate",
          },
          {
            label: "Coverage window",
            value: "On-call rotation",
            tag: "Active",
            tagVariant: "riskLow",
          },
          {
            label: "Audit logging",
            value: "Enabled",
            tag: "Ready",
            tagVariant: "riskLow",
          },
          {
            label: "Fallback routing",
            value: "Supervisor escalation",
            tag: "Configured",
            tagVariant: "riskLow",
          },
        ],
      },
      {
        id: "escalation-queue",
        title: "Escalation queue",
        description: "Admin oversight of urgent routing and follow-up queues.",
        items: [
          {
            label: "On-call handoff",
            value: "Secure queue (Sample)",
            tag: "Active",
            tagVariant: "riskLow",
          },
          {
            label: "Response channel",
            value: "Secure messaging",
            tag: "Configured",
            tagVariant: "riskLow",
          },
          {
            label: "Supervisor review",
            value: "Required for urgent cases",
            tag: "Review",
            tagVariant: "riskModerate",
          },
          {
            label: "Follow-up tracking",
            value: "Daily summary enabled",
            tag: "Active",
            tagVariant: "riskLow",
          },
        ],
      },
    ],
  },
};

export function WorkspacePreview({ role }: { role: WorkspacePreviewRole }) {
  const content = previewContent[role];

  return (
    <PageShell showFooter containerClassName="max-w-none px-0" mainClassName="py-6">
      <div className="page-container space-y-8">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="text-[11px] uppercase tracking-wide text-muted-foreground"
            >
              Workspace preview
            </Badge>
            <Badge
              variant="outline"
              className="text-[11px] uppercase tracking-wide text-muted-foreground"
            >
              Sample data
            </Badge>
          </div>
          <h1>{content.heading}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {content.description}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/demo">
                Explore demo <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">Go to workspace</Link>
            </Button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
          <aside className="space-y-4">
            <Panel className="space-y-3 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Workspace
              </div>
              <div className="text-lg font-semibold">{content.workspaceTitle}</div>
              <p className="text-sm text-muted-foreground">
                {content.workspaceSubtitle}
              </p>
            </Panel>

            <Panel className="space-y-3 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                Navigation
              </div>
              <nav
                aria-label="Preview navigation"
                className="flex flex-col gap-2 text-sm"
              >
                {content.navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </Panel>
          </aside>

          <section className="space-y-6" id="overview">
            <div className="grid gap-4 md:grid-cols-3">
              {content.stats.map((stat) => (
                <Panel key={stat.label} className="space-y-2 p-4">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className="text-lg font-semibold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </Panel>
              ))}
            </div>

            {content.sections.map((section) => (
              <Panel key={section.id} id={section.id} className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold">{section.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase tracking-wide text-muted-foreground"
                  >
                    Sample data
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <div
                      key={`${section.id}-${item.label}`}
                      className="rounded-[var(--radius)] border border-border bg-muted/30 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {item.label}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {item.value}
                        </span>
                        {item.tag ? (
                          <Badge
                            variant={item.tagVariant ?? "outline"}
                            className="text-[10px] uppercase tracking-wide"
                          >
                            {item.tag}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                {section.note ? (
                  <div className="rounded-[var(--radius)] border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                    {section.note}
                  </div>
                ) : null}
              </Panel>
            ))}
          </section>
        </div>
      </div>
    </PageShell>
  );
}
