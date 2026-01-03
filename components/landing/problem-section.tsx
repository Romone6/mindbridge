"use client";

import { Panel } from "@/components/ui/panel";
import { Clock, Zap } from "lucide-react";

export function ProblemSection() {
    return (
        <section className="section-spacing border-b border-border">
            <div className="space-y-8">
                <div className="text-center space-y-3">
                    <h2>Intake bottlenecks slow care.</h2>
                    <p className="text-lg text-muted-foreground">
                        Clinics face fragmented intake workflows, inconsistent data capture, and delayed triage decisions.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Panel className="space-y-4 p-6">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Clock className="h-6 w-6" />
                            <h3 className="text-lg font-semibold text-foreground">Traditional intake</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Manual handoffs and unstructured notes create delays and reduce consistency across clinicians.
                        </p>
                        <div className="rounded-[var(--radius)] border border-dashed border-border p-4 text-xs text-muted-foreground">
                            No operational metrics published yet.
                        </div>
                    </Panel>

                    <Panel className="space-y-4 p-6">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Zap className="h-6 w-6" />
                            <h3 className="text-lg font-semibold text-foreground">MindBridge intake</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Structured capture creates consistent clinical context with configurable escalation paths.
                        </p>
                        <div className="rounded-[var(--radius)] border border-dashed border-border p-4 text-xs text-muted-foreground">
                            No data yet. Outcomes will appear once deployments are active.
                        </div>
                    </Panel>
                </div>
            </div>
        </section>
    );
}
