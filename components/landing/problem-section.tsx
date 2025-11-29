"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { motion, useInView } from "framer-motion";
import { Clock, Zap } from "lucide-react";
import { useRef } from "react";

export function ProblemSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

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
                        The System is <span className="text-destructive">Broken</span>.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-lg text-muted-foreground"
                    >
                        <span className="font-semibold text-foreground">50M Americans</span> lack access to timely care (Milbank, 2024).
                        <br />
                        We built the bridge.
                    </motion.p>
                </div>

                <div ref={ref} className="grid gap-8 md:grid-cols-2 lg:gap-12">
                    {/* Traditional Care */}
                    <GlassCard className="flex flex-col justify-center gap-6 border-white/5 bg-white/5 p-8">
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <Clock className="h-8 w-8" />
                            <h3 className="text-2xl font-semibold">Traditional Care</h3>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Average Wait Time</span>
                                <span className="font-mono text-destructive">48 Days*</span>
                            </div>
                            <div className="h-4 w-full overflow-hidden rounded-full bg-secondary/50">
                                <motion.div
                                    className="h-full bg-destructive"
                                    initial={{ width: "0%" }}
                                    animate={isInView ? { width: "100%" } : { width: "0%" }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                />
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            "Clinicians are overwhelmed. Patients are left in the dark."
                        </p>
                    </GlassCard>

                    {/* MindBridge */}
                    <GlassCard gradient className="flex flex-col justify-center gap-6 border-primary/20 bg-primary/5 p-8">
                        <div className="flex items-center gap-4 text-primary">
                            <Zap className="h-8 w-8" />
                            <h3 className="text-2xl font-semibold text-white">MindBridge AI</h3>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Triage & Support</span>
                                <span className="font-mono text-primary">5 Minutes**</span>
                            </div>
                            <div className="h-4 w-full overflow-hidden rounded-full bg-secondary/50">
                                <motion.div
                                    className="h-full bg-primary shadow-[0_0_15px_var(--primary)]"
                                    initial={{ width: "0%" }}
                                    animate={isInView ? { width: "5%" } : { width: "0%" }}
                                    transition={{ duration: 0.2, delay: 0.5, type: "spring" }}
                                />
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            "Instant access to evidence-based triage and support."
                        </p>
                    </GlassCard>
                </div>

                <div className="mt-8 text-center text-xs text-muted-foreground/50 space-y-1">
                    <p>* Source: Milbank Memorial Fund, 2024.</p>
                    <p>** Based on MindBridge internal beta benchmarks.</p>
                </div>
            </div>
        </section>
    );
}
