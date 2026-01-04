export type FaqLink = {
  label: string;
  href: string;
};

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  links?: FaqLink[];
};

export const faqEntries: FaqEntry[] = [
  {
    id: "security-hipaa",
    question: "Are you HIPAA compliant?",
    answer:
      "MindBridge is built with a security-first approach and aligns with HIPAA principles for handling PHI. We document safeguards and operational controls on our Security page.",
    keywords: ["hipaa", "phi", "compliance", "health data"],
    links: [{ label: "Security & compliance", href: "/security" }],
  },
  {
    id: "security-soc2",
    question: "Do you have SOC 2?",
    answer:
      "We map our controls to SOC 2 Trust Services Criteria (Security, Availability, Processing Integrity, Confidentiality, Privacy). The program is in progress and documented on our Security page.",
    keywords: ["soc 2", "soc2", "trust services", "compliance"],
    links: [{ label: "Security & compliance", href: "/security" }],
  },
  {
    id: "security-encryption",
    question: "Is data encrypted?",
    answer:
      "Yes. We encrypt data in transit with TLS 1.2+ and at rest using AES-256. You can find the full safeguards list on our Security page.",
    keywords: ["encrypt", "encryption", "tls", "aes", "at rest", "in transit"],
    links: [{ label: "Security safeguards", href: "/security" }],
  },
  {
    id: "privacy-phi-training",
    question: "Do you train on patient data?",
    answer:
      "No. Patient data is not used to train foundational models. We use data minimization and zero-retention APIs where applicable.",
    keywords: ["train", "training", "phi", "privacy"],
    links: [{ label: "Security & privacy", href: "/security" }],
  },
  {
    id: "methodology-hybrid",
    question: "How does the system work?",
    answer:
      "MindBridge uses a hybrid model: a conversational layer to capture context and a rules-based guardrail layer that escalates risk cues for clinician review.",
    keywords: ["methodology", "hybrid model", "hybrid", "llm", "guardrail", "rules-based"],
    links: [{ label: "Clinical methodology", href: "/methodology" }],
  },
  {
    id: "safety-not-crisis",
    question: "Is this a crisis service?",
    answer:
      "No. MindBridge is not a crisis service or a replacement for clinical judgment. High-risk cases are escalated to clinicians, and emergencies should go to local services.",
    keywords: ["crisis", "emergency", "suicide", "self harm", "self-harm"],
    links: [{ label: "Safety & ethics", href: "/safety" }],
  },
  {
    id: "faq-medical-device",
    question: "Is MindBridge a medical device?",
    answer:
      "MindBridge is a Clinical Decision Support (CDS) tool that assists clinicians with prioritization. It does not provide diagnoses or treatment plans.",
    keywords: ["medical device", "cds", "diagnosis", "treatment"],
    links: [{ label: "Clinician FAQ", href: "/clinicians/faq" }],
  },
  {
    id: "faq-ai-wrong",
    question: "What happens if the AI is wrong?",
    answer:
      "We use a fail-safe approach: ambiguous or high-risk signals default to a higher risk band and are always reviewed by a clinician.",
    keywords: ["ai is wrong", "ai wrong", "incorrect", "fail-safe", "risk band", "review"],
    links: [{ label: "Clinician FAQ", href: "/clinicians/faq" }],
  },
  {
    id: "faq-customize-protocols",
    question: "Can I customize triage protocols?",
    answer:
      "Yes. Clinics can configure intake prompts, risk thresholds, and escalation pathways to align with their governance policies.",
    keywords: ["custom", "customize", "protocol", "threshold", "escalation", "triage"],
    links: [{ label: "Clinician FAQ", href: "/clinicians/faq" }],
  },
  {
    id: "faq-ehr-integrations",
    question: "Does it integrate with EHR/PMS systems?",
    answer:
      "We are building integrations for major EHR and practice management systems, and support API-based integrations where needed.",
    keywords: ["ehr", "pms", "integration", "api", "practice management"],
    links: [{ label: "Clinician FAQ", href: "/clinicians/faq" }],
  },
  {
    id: "faq-data-residency",
    question: "Where is patient data stored?",
    answer:
      "Data is stored in secure cloud infrastructure with geographic residency controls and encryption in transit and at rest.",
    keywords: ["data stored", "residency", "region", "storage", "location"],
    links: [{ label: "Security & compliance", href: "/security" }],
  },
  {
    id: "faq-pricing",
    question: "Where can I see pricing?",
    answer:
      "Pricing details are available on our pricing page, and we can walk through options during a demo.",
    keywords: ["pricing", "cost", "plan", "subscription"],
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Book a demo", href: "/demo" },
    ],
  },
];

export const safetyTriggers = [
  "suicide",
  "self harm",
  "self-harm",
  "kill myself",
  "end my life",
  "hurt myself",
  "overdose",
  "emergency",
  "immediate danger",
];

export const bookingTriggers = [
  "book demo",
  "schedule demo",
  "book a demo",
  "schedule a demo",
  "talk to sales",
  "contact sales",
];
