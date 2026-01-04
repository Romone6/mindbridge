"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ClipboardList, ShieldCheck, Stethoscope, Sparkles } from "lucide-react";
import Link from "next/link";

type DemoStep = {
    id: string;
    title: string;
    description: string;
    highlights: string[];
    preview: {
        label: string;
        items: { label: string; value: string }[];
    };
    icon: ReactNode;
};

const DEMO_STEPS: DemoStep[] = [
    {
        id: "intake",
        title: "Intake capture",
        description: "A structured intake flow that normalizes symptoms, context, and goals.",
        highlights: [
            "Adaptive question sequencing",
            "Validated screening instruments",
            "Patient-friendly language",
        ],
        preview: {
            label: "Patient intake snapshot",
            items: [
                { label: "Primary concern", value: "Persistent anxiety and poor sleep" },
                { label: "Goal", value: "Understand triggers and stabilize routine" },
                { label: "Screening", value: "PHQ-9 + GAD-7 completed" },
            ],
        },
        icon: <ClipboardList className="h-4 w-4 text-muted-foreground" />,
    },
    {
        id: "risk",
        title: "Risk signals",
        description: "Transparent risk flags for clinician review, never auto-decisions.",
        highlights: [
            "Clear reasoning for flags",
            "Escalation thresholds configurable",
            "Audit-ready event log",
        ],
        preview: {
            label: "Risk review",
            items: [
                { label: "Flag", value: "Passive ideation mention" },
                { label: "Confidence", value: "Requires clinician review" },
                { label: "Recommendation", value: "Schedule priority assessment" },
            ],
        },
        icon: <ShieldCheck className="h-4 w-4 text-muted-foreground" />,
    },
    {
        id: "summary",
        title: "Structured summary",
        description: "A clinician-ready summary that is easy to scan and edit.",
        highlights: [
            "Problem list & history",
            "Protective factors highlighted",
            "Editable narrative output",
        ],
        preview: {
            label: "Clinician summary",
            items: [
                { label: "Key themes", value: "Sleep disruption, work stress, rumination" },
                { label: "Protective factors", value: "Supportive partner, engaged in therapy" },
                { label: "Next step", value: "Intake session with primary clinician" },
            ],
        },
        icon: <Stethoscope className="h-4 w-4 text-muted-foreground" />,
    },
    {
        id: "handoff",
        title: "Team handoff",
        description: "Coordinate scheduling and follow-up without losing context.",
        highlights: [
            "Assignment workflows",
            "Shared notes for care team",
            "Escalation tracking",
        ],
        preview: {
            label: "Care coordination",
            items: [
                { label: "Assigned to", value: "Dr. Patel (Primary Clinician)" },
                { label: "Timeline", value: "Initial session within 48 hours" },
                { label: "Notes", value: "Follow-up on sleep hygiene plan" },
            ],
        },
        icon: <Sparkles className="h-4 w-4 text-muted-foreground" />,
    },
];

export function DemoSection() {
    const [activeId, setActiveId] = useState(DEMO_STEPS[0].id);
    const activeStep = useMemo(
        () => DEMO_STEPS.find((step) => step.id === activeId) ?? DEMO_STEPS[0],
        [activeId]
    );

    return (
        <section id="features" className="section-spacing border-b border-border">
            <div className="space-y-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2 max-w-2xl">
                        <Badge variant="outline" className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Demo
                        </Badge>
                        <h2>See the intake workflow, end to end.</h2>
                        <p className="text-muted-foreground">
                            A guided walkthrough of how MindBridge collects intake context, surfaces risk signals, and prepares
                            a clinician-ready summary.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link href="/demo">
                            View full demo <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="space-y-3">
                        {DEMO_STEPS.map((step) => (
                            <button
                                key={step.id}
                                type="button"
                                onClick={() => setActiveId(step.id)}
                                className={`w-full rounded-[var(--radius)] border px-4 py-3 text-left transition-colors ${
                                    step.id === activeId
                                        ? "border-foreground/20 bg-foreground/5 text-foreground"
                                        : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
                                        {step.icon}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-foreground">{step.title}</div>
                                        <div className="text-xs text-muted-foreground">{step.description}</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <motion.div
                        key={activeStep.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="space-y-4"
                    >
                        <Panel className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold text-foreground">{activeStep.title}</div>
                                    <div className="text-xs text-muted-foreground">Example / simulated data</div>
                                </div>
                                <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                    Guided demo
                                </Badge>
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground">
                                {activeStep.highlights.map((item) => (
                                    <div key={item} className="flex items-start gap-2">
                                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </Panel>

                        <Panel className="p-6">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                {activeStep.preview.label}
                            </div>
                            <div className="mt-4 space-y-3 text-sm">
                                {activeStep.preview.items.map((item) => (
                                    <div key={item.label} className="flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground">{item.label}</span>
                                        <span className="font-medium text-foreground">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
