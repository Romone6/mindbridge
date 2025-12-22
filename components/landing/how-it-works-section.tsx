"use client";

import { Panel } from "@/components/ui/panel";
import { motion } from "framer-motion";
import { ClipboardCheck, HeartHandshake, AlertTriangle } from "lucide-react";

const steps = [
    {
        title: "Check-in",
        description: "Patient answers guided questions via our empathetic chat interface.",
        icon: ClipboardCheck,
        color: "text-emerald-400",
    },
    {
        title: "AI Analysis",
        description: "Our engine instantly estimates risk and surfaces key clinical factors.",
        icon: AlertTriangle,
        color: "text-amber-400",
    },
    {
        title: "Clinical Summary",
        description: "Clinicians see a structured view with risk bands and reasoning.",
        icon: ClipboardCheck,
        color: "text-blue-400",
    },
    {
        title: "Expert Care",
        description: "Clinicians decide the next step: call, schedule, or refer.",
        icon: HeartHandshake,
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

                <div className="grid gap-8 md:grid-cols-4 relative">
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
                            <Panel className="flex flex-col items-center text-center p-8 h-full hover:border-primary transition-colors">
                                <div className={`rounded-full bg-white/5 p-4 mb-6 ${step.color} ring-1 ring-white/10`}>
                                    <step.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </Panel>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
