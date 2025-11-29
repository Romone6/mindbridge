"use client";

import { NeonButton } from "@/components/ui/neon-button";
import { motion } from "framer-motion";
import { ArrowRight, Activity } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
    return (
        <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 pt-20 text-center md:px-6">
            {/* Background Effects */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
            </div>

            {/* Neural Core Animation (Placeholder for 3D) */}
            <motion.div
                className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-30"
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 90, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
            >
                <div className="h-full w-full rounded-full border border-primary/30 blur-sm" />
                <div className="absolute inset-0 rotate-45 rounded-full border border-secondary/30 blur-sm" />
            </motion.div>

            {/* Content */}
            <div className="z-10 max-w-4xl space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        </span>
                        Accepting Early Access
                    </div>

                    <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl md:text-8xl">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">AI-First</span> <br />
                        Mental Health Clinic
                    </h1>

                    <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
                        1 in 3 adults report depression. MindBridge scales care instantly. <br />
                        Reduce wait times from 48 days to 5 minutes with our clinical-grade AI agents.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                >
                    <NeonButton size="lg" className="h-12 px-8 text-base">
                        Join Waitlist <ArrowRight className="ml-2 h-4 w-4" />
                    </NeonButton>
                    <Link href="/demo">
                        <NeonButton variant="outline" size="lg" className="h-12 px-8 text-base border-white/10 bg-white/5 hover:bg-white/10">
                            View Demo <Activity className="ml-2 h-4 w-4" />
                        </NeonButton>
                    </Link>
                </motion.div>

                {/* Demo GIF Placeholder */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="relative mx-auto mt-12 max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-2xl"
                >
                    <div className="aspect-video w-full bg-black/50 flex items-center justify-center text-muted-foreground">
                        <span className="animate-pulse">Looping Demo GIF Placeholder</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="h-12 w-6 rounded-full border border-white/20 p-1">
                    <div className="h-2 w-full rounded-full bg-white/50" />
                </div>
            </motion.div>
        </section>
    );
}
