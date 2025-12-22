"use client";

import { Panel } from "@/components/ui/panel";
import { motion } from "framer-motion";
import {
    Bot,
    Brain,
    FileText,
    ShieldCheck,
    CreditCard,
    LineChart
} from "lucide-react";

const agents = [
    {
        title: "Intake Agent",
        description: "24/7 triage, risk assessment (PHQ-9/GAD-7), and patient routing.",
        icon: Bot,
        color: "text-emerald-400",
        colSpan: "md:col-span-2",
    },
    {
        title: "Therapy Agent",
        description: "Delivers CBT modules, mindfulness exercises, and journaling support.",
        icon: Brain,
        color: "text-blue-400",
        colSpan: "md:col-span-1",
    },
    {
        title: "Compliance Agent",
        description: "Real-time monitoring for self-harm flags and HIPAA adherence.",
        icon: ShieldCheck,
        color: "text-rose-400",
        colSpan: "md:col-span-1",
    },
    {
        title: "Documentation Agent",
        description: "Auto-generates clinical notes (SOAP) and codes sessions (ICD-10).",
        icon: FileText,
        color: "text-purple-400",
        colSpan: "md:col-span-2",
    },
    {
        title: "Finance Agent",
        description: "Cost controls, utilization trends, and performance reporting.",
        icon: CreditCard,
        color: "text-amber-400",
        colSpan: "md:col-span-1",
    },
    {
        title: "Growth Agent",
        description: "Patient engagement, retention campaigns, and analytics.",
        icon: LineChart,
        color: "text-cyan-400",
        colSpan: "md:col-span-2",
    },
];

export function SolutionSection() {
    return (
        <section className="relative w-full py-24 md:py-32 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-16 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
                    >
                        Meet Your <span className="text-primary">Digital Workforce</span>.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-lg text-muted-foreground"
                    >
                        A complete clinical team, available instantly, at a fraction of the cost.
                    </motion.p>
                </div>

                <div className="grid gap-4 md:grid-cols-3 lg:gap-6 max-w-6xl mx-auto">
                    {agents.map((agent, index) => (
                        <Panel
                            key={agent.title}
                            className={`flex flex-col justify-between gap-4 p-6 hover:border-primary/50 transition-colors ${agent.colSpan}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className={`rounded-full bg-white/5 p-3 ${agent.color}`}>
                                    <agent.icon className="h-6 w-6" />
                                </div>
                                <div className="text-xs font-mono text-muted-foreground/50">
                                    v1.0
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">{agent.title}</h3>
                                <p className="text-sm text-muted-foreground">{agent.description}</p>
                            </div>
                        </Panel>
                    ))}
                </div>
            </div>
        </section>
    );
}
