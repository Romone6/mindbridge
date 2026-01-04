export type ResearchLink = {
  label: string;
  href: string;
};

export type ResearchSection = {
  heading: string;
  body: string;
};

export type ResearchItem = {
  slug: string;
  title: string;
  abstract: string;
  date: string;
  tags: string[];
  status?: string;
  links?: ResearchLink[];
  sections: ResearchSection[];
};

export const researchItems: ResearchItem[] = [
  {
    slug: "clinical-intake-overview",
    title: "Clinical intake overview",
    abstract:
      "A structured summary of how MindBridge captures intake context, consent, and safety indicators without replacing clinical judgment.",
    date: "2024-11-05",
    tags: ["Methodology", "Intake", "Safety"],
    status: "Living document",
    links: [
      {
        label: "Download whitepaper PDF",
        href: "/docs/mindbridge_whitepaper.pdf",
      },
    ],
    sections: [
      {
        heading: "Purpose",
        body: "This overview documents the intake workflow, including which data is collected and how it is presented to clinical teams for review.",
      },
      {
        heading: "Safety framing",
        body: "MindBridge flags potential risk indicators and routes cases for clinician review. It does not diagnose or make care decisions.",
      },
      {
        heading: "Configuration notes",
        body: "Clinics can adjust intake prompts, escalation thresholds, and consent language to align with local policy.",
      },
    ],
  },
  {
    slug: "risk-signal-review",
    title: "Risk signal review workflow",
    abstract:
      "An outline of how risk cues are summarized for clinicians, including escalation routing and audit trails.",
    date: "2024-10-18",
    tags: ["Safety", "Workflow", "Compliance"],
    status: "Program in progress",
    sections: [
      {
        heading: "Signal collection",
        body: "Signals are collected from structured questions and summarized into clinician-readable highlights.",
      },
      {
        heading: "Escalation readiness",
        body: "Escalation steps are always reviewed by a clinician. Any automated output is advisory only.",
      },
      {
        heading: "Audit visibility",
        body: "Review notes and changes are logged so compliance teams can validate the workflow.",
      },
    ],
  },
  {
    slug: "implementation-briefing",
    title: "Implementation briefing",
    abstract:
      "A practical checklist for onboarding MindBridge, covering intake configuration, staff training, and compliance alignment.",
    date: "2024-09-30",
    tags: ["Implementation", "Operations"],
    status: "Planning",
    sections: [
      {
        heading: "Readiness",
        body: "Identify clinical owners, define escalation policies, and confirm data handling requirements before launch.",
      },
      {
        heading: "Pilot steps",
        body: "Start with a limited intake cohort, validate operational fit, and expand once clinical review is consistent.",
      },
    ],
  },
  {
    slug: "evaluation-roadmap",
    title: "Evaluation roadmap",
    abstract:
      "Upcoming plans for pilot studies and validation reporting, including timelines and governance review steps.",
    date: "2024-08-12",
    tags: ["Research", "Governance"],
    status: "Upcoming",
    sections: [
      {
        heading: "Pilot design",
        body: "Pilot protocols are being drafted in partnership with clinicians and will be published after governance approval.",
      },
      {
        heading: "Reporting",
        body: "We will share outcomes summaries once data collection is complete and reviewed by clinical partners.",
      },
    ],
  },
];

export const researchTags = Array.from(
  new Set(researchItems.flatMap((item) => item.tags))
).sort((a, b) => a.localeCompare(b));

export function getResearchItem(slug: string) {
  return researchItems.find((item) => item.slug === slug) ?? null;
}
