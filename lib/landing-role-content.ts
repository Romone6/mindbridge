export type LandingRole = "clinician" | "admin" | "patient";

export type RoleBullet = {
    title: string;
    description: string;
};

export type RoleContent = {
    headline: string;
    subheadline: string;
    bullets: RoleBullet[];
    cta: {
        label: string;
        href: string;
    };
    narrative: {
        title: string;
        lead: string;
        points: [string, string];
    };
};

export const ROLE_OPTIONS: Array<{ value: LandingRole; label: string }> = [
    { value: "clinician", label: "Clinician" },
    { value: "admin", label: "Clinic Admin" },
    { value: "patient", label: "Patient" },
];

export const DEFAULT_ROLE: LandingRole = "clinician";

export const ROLE_CONTENT: Record<LandingRole, RoleContent> = {
    clinician: {
        headline: "AI-assisted mental health intake for clinical teams.",
        subheadline:
            "MindBridge standardizes intake workflows, captures structured clinical context, and routes cases to the right clinician faster without sacrificing safety or oversight.",
        bullets: [
            {
                title: "Structured intake",
                description: "Capture consistent clinical context across every patient, regardless of entry point.",
            },
            {
                title: "Human oversight",
                description: "Clinicians remain the final decision-makers for risk and escalation.",
            },
            {
                title: "Enterprise readiness",
                description: "Security, auditability, and configuration designed for regulated care settings.",
            },
        ],
        cta: {
            label: "View the demo",
            href: "/demo",
        },
        narrative: {
            title: "Designed for clinical teams.",
            lead: "MindBridge standardizes intake conversations and produces structured summaries clinicians can review quickly. The system is designed to support, not replace, human judgment.",
            points: [
                "Patients complete intake in a guided flow that captures presenting concerns, context, and safety indicators with clear language and transparency.",
                "Clinicians receive concise outputs that integrate into existing review workflows, with audit visibility and configurable escalation paths.",
            ],
        },
    },
    admin: {
        headline: "Operationally-ready intake for modern clinics.",
        subheadline:
            "Align intake, triage, and escalation across teams with consistent workflows and clinic-level visibility.",
        bullets: [
            {
                title: "Workflow consistency",
                description: "Standardize intake across sites while keeping clinician review front and center.",
            },
            {
                title: "Team routing",
                description: "Coordinate assignments, handoffs, and escalation thresholds with clarity.",
            },
            {
                title: "Compliance visibility",
                description: "Keep audit trails and safety checkpoints aligned with clinic policy.",
            },
        ],
        cta: {
            label: "See admin overview",
            href: "/demo",
        },
        narrative: {
            title: "Built for clinic operations.",
            lead: "Give administrators a clear view of intake volume, team capacity, and escalation readiness without adding manual coordination work.",
            points: [
                "Standard workflows help maintain quality across clinics while keeping staffing and oversight transparent.",
                "Configurability keeps protocols aligned to your policies, without compromising clinician autonomy.",
            ],
        },
    },
    patient: {
        headline: "Clear, supportive intake for every patient.",
        subheadline:
            "A guided experience that captures what you are experiencing and gets it to the right clinician with care and clarity.",
        bullets: [
            {
                title: "Guided questions",
                description: "Complete intake with clear, respectful prompts that explain why each step matters.",
            },
            {
                title: "Transparent safety checks",
                description: "Safety prompts are clear about when additional support is needed.",
            },
            {
                title: "Structured handoff",
                description: "Your responses arrive in a format clinicians can review quickly and safely.",
            },
        ],
        cta: {
            label: "See the intake flow",
            href: "/demo",
        },
        narrative: {
            title: "Intake that respects patients.",
            lead: "MindBridge makes it easier to share your context once, while ensuring clinicians receive the details they need to respond thoughtfully.",
            points: [
                "Guided language helps you describe symptoms, goals, and safety concerns without having to repeat yourself.",
                "Clinicians receive a clear summary so they can focus on next steps instead of re-collecting information.",
            ],
        },
    },
};

export const parseLandingRole = (value: string | null | undefined): LandingRole | null => {
    if (!value) return null;
    const normalized = value.toLowerCase();
    if (normalized === "clinician" || normalized === "admin" || normalized === "patient") {
        return normalized;
    }
    return null;
};

export const resolveLandingRole = (options: {
    queryRole?: string | null;
    storedRole?: string | null;
}): LandingRole => {
    const query = parseLandingRole(options.queryRole);
    if (query) return query;
    const stored = parseLandingRole(options.storedRole);
    if (stored) return stored;
    return DEFAULT_ROLE;
};

export const ROLE_STORAGE_KEY = "mb_role";

export const readStoredRole = (storage: Pick<Storage, "getItem"> | null): LandingRole | null => {
    if (!storage) return null;
    return parseLandingRole(storage.getItem(ROLE_STORAGE_KEY));
};

export const persistStoredRole = (storage: Pick<Storage, "setItem"> | null, role: LandingRole) => {
    if (!storage) return;
    storage.setItem(ROLE_STORAGE_KEY, role);
};
