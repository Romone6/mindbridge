"use client";

import { Panel } from "@/components/ui/panel";
import { ArrowRight, ArrowDown } from "lucide-react";

export function SystemDiagram() {
    return (
        <section className="w-full border-b border-border py-24 bg-background">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h2 className="text-2xl font-bold font-mono uppercase tracking-widest text-muted-foreground mb-4">Architecture</h2>
                    <p className="text-xl text-foreground max-w-2xl">A deterministic pipeline for clinical safety.</p>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Step 1 */}
                    <Panel className="p-6 relative group hover:border-primary transition-colors">
                        <div className="text-xs font-mono text-muted-foreground mb-2">01. INGESTION</div>
                        <h3 className="text-lg font-bold mb-2">Secure Input</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Patient data is encrypted (AES-256) and anonymized at edge associated with temporary session ID.
                        </p>
                        <div className="w-full bg-muted h-1 mt-2 mb-2 relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full w-1/3 bg-primary animate-pulse"></div>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 md:hidden">
                            <ArrowDown className="text-muted-foreground h-6 w-6" />
                        </div>
                        <div className="absolute -right-8 top-1/2 -translate-y-1/2 hidden md:block">
                            <ArrowRight className="text-muted-foreground h-6 w-6" />
                        </div>
                    </Panel>

                    {/* Step 2 */}
                    <Panel className="p-6 relative group hover:border-primary transition-colors">
                        <div className="text-xs font-mono text-muted-foreground mb-2">02. ANALYSIS</div>
                        <h3 className="text-lg font-bold mb-2">Risk Stratification</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Dual-layer analysis: LLM semantic extraction + Deterministic rule engine for critical keywords.
                        </p>
                        <div className="flex gap-2">
                            <div className="px-2 py-1 bg-muted rounded text-[10px] font-mono">LLM</div>
                            <div className="px-2 py-1 bg-muted rounded text-[10px] font-mono">+</div>
                            <div className="px-2 py-1 bg-muted rounded text-[10px] font-mono">RULES</div>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 md:hidden">
                            <ArrowDown className="text-muted-foreground h-6 w-6" />
                        </div>
                        <div className="absolute -right-8 top-1/2 -translate-y-1/2 hidden md:block">
                            <ArrowRight className="text-muted-foreground h-6 w-6" />
                        </div>
                    </Panel>

                    {/* Step 3 */}
                    <Panel className="p-6 relative group hover:border-primary transition-colors">
                        <div className="text-xs font-mono text-muted-foreground mb-2">03. TRIAGE</div>
                        <h3 className="text-lg font-bold mb-2">Clinician Handoff</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Generated summaries and risk scores are pushed to the EHR dashboard for human review.
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-mono text-emerald-600">READY_FOR_REVIEW</span>
                        </div>
                    </Panel>
                </div>
            </div>
        </section>
    );
}
