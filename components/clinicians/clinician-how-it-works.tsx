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
        <section id="how-it-works" className="section-spacing border-b border-border">
            <div className="space-y-6">
                <div className="space-y-3">
                    <Badge variant="outline">Workflow</Badge>
                    <h2>Operational flow.</h2>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        Intake data is captured, reviewed, and escalated according to your clinic configuration.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, index) => (
                        <Panel key={step.id} className="relative flex h-full flex-col gap-4 p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted/40 text-muted-foreground">
                                    <step.icon className="h-5 w-5" />
                                </div>
                                <span className="text-xs text-muted-foreground">{step.id}</span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold">{step.title}</h3>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                                    <ArrowRight className="h-5 w-5" />
                                </div>
                            )}
                        </Panel>
                    ))}
                </div>
            </div>
        </section>
    );
}
