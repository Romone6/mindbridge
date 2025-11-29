"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Activity, ShieldAlert, Brain } from "lucide-react";
import { motion } from "framer-motion";

interface RiskMonitorProps {
    score: number;
    analysis: string;
}

export function RiskMonitor({ score, analysis }: RiskMonitorProps) {
    // Determine color based on score
    const getColor = (s: number) => {
        if (s < 30) return "text-emerald-400";
        if (s < 70) return "text-amber-400";
        return "text-rose-500";
    };

    const colorClass = getColor(score);

    return (
        <GlassCard className="h-full p-6 border-white/10 bg-black/40 backdrop-blur-xl flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Real-Time Analysis</h3>
            </div>

            {/* Risk Score Gauge */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Risk Stratification</span>
                    <span className={`font-mono font-bold ${colorClass}`}>{score}/100</span>
                </div>
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full ${score < 30 ? 'bg-emerald-500' : score < 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, type: "spring" }}
                    />
                </div>
            </div>

            {/* Clinical Analysis Stream */}
            <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Brain className="h-4 w-4" />
                    <span>Clinical Reasoning</span>
                </div>
                <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-sm font-mono text-muted-foreground/80 min-h-[100px]">
                    {analysis ? (
                        <motion.p
                            key={analysis}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {">"} {analysis}
                        </motion.p>
                    ) : (
                        <span className="animate-pulse">Waiting for input...</span>
                    )}
                </div>
            </div>

            {/* Status Badge */}
            <div className={`mt-auto flex items-center gap-2 p-3 rounded-lg border ${score > 70 ? 'border-rose-500/20 bg-rose-500/10' : 'border-emerald-500/20 bg-emerald-500/10'}`}>
                <ShieldAlert className={`h-5 w-5 ${colorClass}`} />
                <div className="text-xs">
                    <div className="font-semibold text-foreground">
                        {score > 70 ? "Escalation Protocol" : "Standard Monitoring"}
                    </div>
                    <div className="text-muted-foreground">
                        {score > 70 ? "Clinician Alerted" : "AI Triage Active"}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
