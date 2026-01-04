"use client";

import { Panel } from "@/components/ui/panel";

export function NarrativeSection() {
    return (
        <section id="integrations" className="section-spacing border-b border-border">
            <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-start">
                <div className="space-y-6">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Product</div>
                    <h2>Designed for clinical teams.</h2>
                    <p className="text-lg text-muted-foreground">
                        MindBridge standardizes intake conversations and produces structured summaries clinicians can review quickly.
                        The system is designed to support, not replace, human judgment.
                    </p>
                    <div className="grid gap-6 text-sm text-muted-foreground sm:grid-cols-2">
                        <p>
                            Patients complete intake in a guided flow that captures presenting concerns, context, and safety indicators
                            with clear language and transparency.
                        </p>
                        <p>
                            Clinicians receive concise outputs that integrate into existing review workflows, with audit visibility
                            and configurable escalation paths.
                        </p>
                    </div>
                </div>

                <Panel className="p-6 space-y-4">
                    <div className="text-sm font-semibold">Core modules</div>
                    <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-start justify-between gap-3">
                            <span className="text-foreground font-medium">Intake capture</span>
                            <span>Structured prompts and patient context.</span>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                            <span className="text-foreground font-medium">Risk review</span>
                            <span>Transparent signals for clinician triage.</span>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                            <span className="text-foreground font-medium">Escalation</span>
                            <span>Configurable thresholds with audit visibility.</span>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                            <span className="text-foreground font-medium">Audit trail</span>
                            <span>Review history with no synthetic metrics.</span>
                        </div>
                    </div>
                    <div className="rounded-[var(--radius)] border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                        Modules activate as you configure your clinic workspace.
                    </div>
                </Panel>
            </div>
        </section>
    );
}
