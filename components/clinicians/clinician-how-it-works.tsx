"use client";

import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, BrainCircuit, FileText, UserCheck, ArrowRight } from "lucide-react";

const steps = [
    {
        id: "01",
        title: "Patient Interaction",
        description: "Patient answers guided questions via chat interface.",
        icon: MessageSquare,
    },
    {
        id: "02",
        title: "AI Analysis",
        description: "AI + rules engine estimates risk & surfaces key factors.",
        icon: BrainCircuit,
    },
    {
        id: "03",
        title: "Clinician Review",
        description: "Clinician sees a structured summary + risk band.",
        icon: FileText,
    },
    {
        id: "04",
        title: "Intervention",
        description: "Clinician decides next step (call, schedule, refer).",
        icon: UserCheck,
    },
];

export function ClinicianHowItWorks() {
    return (
        <section id="how-it-works" className="w-full py-24 bg-muted/20 border-b border-border">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <Badge variant="outline" className="mb-4">System_Workflow</Badge>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Operational Flow
                        </h2>
                    </div>
                    <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                        MindBridge automates the information gathering phase, delivering structured clinical data directly to your dashboard.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, index) => (
                        <Panel key={step.id} className="p-6 relative group hover:border-emerald-500/30 transition-colors">
                            <div className="flex items-center justify-between mb-6">
                                <div className="h-10 w-10 flex items-center justify-center rounded bg-muted text-muted-foreground group-hover:text-emerald-600 group-hover:bg-emerald-500/10 transition-colors">
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <span className="font-mono text-xs text-muted-foreground/50">{step.id}</span>
                            </div>

                            <h3 className="font-semibold mb-2 pr-4">{step.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {step.description}
                            </p>

                            {/* Connector Arrow (Desktop only, except last item) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/20">
                                    <ArrowRight className="h-6 w-6" />
                                </div>
                            )}
                        </Panel>
                    ))}
                </div>
            </div>
        </section>
    );
}
