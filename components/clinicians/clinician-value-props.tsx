"use client";

import { Panel } from "@/components/ui/panel";
import { motion } from "framer-motion";
import { Zap, FileSearch, Clock } from "lucide-react";

const props = [
    {
        title: "Faster Triage & Prioritisation",
        description: "Automatically stratify patients by risk level before they even enter the waiting room.",
        icon: Zap,
        color: "text-amber-400",
    },
    {
        title: "Structured Risk View",
        description: "Get a clinical summary and risk band (Low/Moderate/High) instantly.",
        icon: FileSearch,
        color: "text-blue-400",
    },
    {
        title: "Better Time Allocation",
        description: "Focus your limited time on high-acuity cases while AI supports lower-risk patients.",
        icon: Clock,
        color: "text-emerald-400",
    },
];

export function ClinicianValueProps() {
    return (
        <section className="w-full py-12 md:py-24 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid gap-8 md:grid-cols-3">
                    {props.map((prop, index) => (
                        <motion.div
                            key={prop.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                        >
                            <Panel className="flex flex-col items-start p-8 h-full hover:border-primary/50 transition-colors border-white/5 bg-white/5">
                                <div className={`rounded-lg bg-white/5 p-3 mb-6 ${prop.color}`}>
                                    <prop.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{prop.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{prop.description}</p>
                            </Panel>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
