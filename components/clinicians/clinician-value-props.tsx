"use client";

import { Panel } from "@/components/ui/panel";
import { motion } from "framer-motion";
import { Zap, FileSearch, Clock } from "lucide-react";

const props = [
    {
        title: "Consistent triage capture",
        description: "Standardize intake questions to capture clinical context without manual handoffs.",
        icon: Zap,
        color: "text-amber-500",
    },
    {
        title: "Structured clinician view",
        description: "Summaries and risk indicators are provided for review with audit visibility.",
        icon: FileSearch,
        color: "text-blue-500",
    },
    {
        title: "Focused workflows",
        description: "Route cases to the right clinician based on your practice configuration.",
        icon: Clock,
        color: "text-emerald-500",
    },
];

export function ClinicianValueProps() {
    return (
        <section className="section-spacing border-b border-border">
            <div className="grid gap-6 md:grid-cols-3">
                {props.map((prop, index) => (
                    <motion.div
                        key={prop.title}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Panel className="flex h-full flex-col items-start gap-4 p-6">
                            <div className={`rounded-lg bg-muted/40 p-3 ${prop.color}`}>
                                <prop.icon className="h-6 w-6" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">{prop.title}</h3>
                                <p className="text-sm text-muted-foreground">{prop.description}</p>
                            </div>
                        </Panel>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
