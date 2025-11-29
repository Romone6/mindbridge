"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { ClipboardCheck, HeartHandshake, AlertTriangle } from "lucide-react";

const steps = [
    {
        title: "Assess",
        description: "Intake Agent conducts a clinical interview (PHQ-9/GAD-7) to stratify risk.",
        icon: ClipboardCheck,
        color: "text-emerald-400",
    },
    {
        title: "Support",
        description: "Therapy Agent provides immediate CBT modules, coping strategies, and empathetic chat.",
        icon: HeartHandshake,
        color: "text-blue-400",
    },
    {
        title: "Escalate",
        description: "If high risk is detected, the system instantly alerts a human clinician for intervention.",
        icon: AlertTriangle,
        color: "text-rose-400",
    },
];

export function HowItWorksSection() {
    return (
        <section className="relative w-full py-24 md:py-32 bg-background/50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        How It <span className="text-primary">Works</span>.
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        A seamless flow from intake to intervention.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-rose-500/20 z-0" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="relative z-10"
                        >
                            <GlassCard className="flex flex-col items-center text-center p-8 h-full hover:bg-white/5 transition-colors">
                                <div className={`rounded-full bg-white/5 p-4 mb-6 ${step.color} ring-1 ring-white/10`}>
                                    <step.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
