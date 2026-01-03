"use client";

export function NarrativeSection() {
    return (
        <section className="section-spacing border-b border-border">
            <div className="max-w-3xl space-y-6">
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
        </section>
    );
}
