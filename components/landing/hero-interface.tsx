"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { Bot, User, Activity, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";

export function HeroInterface() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev + 1) % 4);
        }, 3000); // Change step every 3 seconds
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative mx-auto mt-12 max-w-4xl">
            {/* Main Interface Window */}
            <GlassCard className="relative overflow-hidden border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl rounded-xl h-[400px] flex">

                {/* Sidebar (Risk Monitor) */}
                <div className="w-1/3 border-r border-white/10 p-4 flex flex-col gap-4 bg-white/5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground border-b border-white/10 pb-2">
                        <Activity className="h-4 w-4" />
                        <span>Live Analysis</span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Risk Score</span>
                            <span className="font-mono text-primary">{step >= 2 ? "72/100" : step >= 1 ? "45/100" : "12/100"}</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
                                animate={{ width: step >= 2 ? "72%" : step >= 1 ? "45%" : "12%" }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 p-3 rounded-lg bg-black/20 text-xs font-mono text-muted-foreground space-y-2 overflow-hidden">
                        <motion.div animate={{ opacity: step >= 0 ? 1 : 0.3 }}>{">"} Session initialized.</motion.div>
                        <motion.div animate={{ opacity: step >= 1 ? 1 : 0.3 }}>{">"} Analyzing sentiment...</motion.div>
                        <motion.div animate={{ opacity: step >= 2 ? 1 : 0.3 }} className="text-rose-400">{">"} Risk factor detected.</motion.div>
                        <motion.div animate={{ opacity: step >= 3 ? 1 : 0.3 }} className="text-primary">{">"} Escalation recommended.</motion.div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-6 flex flex-col gap-4">
                    {/* Message 1: AI Greeting */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                    >
                        <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="p-3 rounded-2xl bg-white/5 text-sm text-muted-foreground max-w-[80%]">
                            Hello. I'm MindBridge. How are you feeling today?
                        </div>
                    </motion.div>

                    {/* Message 2: User Response */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 10 }}
                        className="flex gap-3 flex-row-reverse"
                    >
                        <div className="h-8 w-8 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0">
                            <User className="h-4 w-4" />
                        </div>
                        <div className="p-3 rounded-2xl bg-primary/20 text-primary-foreground text-sm max-w-[80%]">
                            I've been feeling really overwhelmed lately. I can't sleep.
                        </div>
                    </motion.div>

                    {/* Message 3: AI Analysis/Response */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 10 }}
                        className="flex gap-3"
                    >
                        <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="p-3 rounded-2xl bg-white/5 text-sm text-muted-foreground max-w-[80%]">
                            I understand. Sleep disruption is a common sign of stress. Have you had any thoughts of hurting yourself?
                        </div>
                    </motion.div>

                    {/* Message 4: Escalation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: step >= 3 ? 1 : 0, scale: step >= 3 ? 1 : 0.9 }}
                        className="mt-auto mx-auto"
                    >
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                            <ShieldAlert className="h-4 w-4" />
                            Clinician Alerted • Priority 1
                        </div>
                    </motion.div>

                </div>
            </GlassCard>

            {/* Reflection/Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-cyan-400/20 rounded-xl blur-2xl -z-10 opacity-50" />
        </div>
    );
}
