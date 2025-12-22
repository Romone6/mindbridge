"use client";

import { Panel } from "@/components/ui/panel";
import { Activity, ShieldAlert, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface RiskMonitorProps {
    score: number;
    analysis: string;
}

export function RiskMonitor({ score = 0, analysis = "Waiting for data stream..." }: RiskMonitorProps) {
    const getRiskLevel = (s: number) => {
        if (s < 30) return "LOW";
        if (s < 70) return "MODERATE";
        return "HIGH";
    };

    const riskLevel = getRiskLevel(score);
    const riskVariant = riskLevel === "LOW" ? "riskLow" : riskLevel === "MODERATE" ? "riskModerate" : "riskHigh";

    return (
        <Panel className="h-full flex flex-col overflow-hidden bg-card border-l border-border rounded-none md:rounded-r-lg shadow-none">
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        <span>Risk_Monitor_v2</span>
                    </div>
                    <Badge variant={riskVariant} className="font-mono text-[10px]">
                        {riskLevel}_RISK
                    </Badge>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Score Display (Digital) */}
                <div className="text-center p-6 border border-border bg-muted/10 rounded-lg">
                    <div className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-widest">Composite Score</div>
                    <div className="text-5xl font-mono font-bold tracking-tighter text-foreground">
                        {String(score).padStart(3, '0')}
                    </div>
                </div>

                {/* Vertical Level Meters */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-muted-foreground">
                        <span>SAFE</span>
                        <span>CRITICAL</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-none flex gap-0.5">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div
                                key={i}
                                className={`flex-1 transition-colors duration-300 ${(i / 20) * 100 < score
                                        ? score > 70 ? 'bg-red-500' : score > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                                        : 'bg-transparent'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Analysis Log */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                        <Cpu className="h-4 w-4" />
                        <span>Inference_Log</span>
                    </div>
                    <div className="p-4 border border-border bg-muted/10 rounded min-h-[120px] font-mono text-xs leading-relaxed text-muted-foreground">
                        {analysis ? (
                            <motion.div
                                key={analysis}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <span className="text-primary">[SYS]</span> {analysis}
                            </motion.div>
                        ) : (
                            <span className="animate-pulse">_</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Status */}
            <div className="mt-auto p-4 border-t border-border bg-muted/30">
                {score > 70 ? (
                    <div className="flex items-center gap-3 text-red-600">
                        <ShieldAlert className="h-5 w-5" />
                        <div className="text-xs font-mono">
                            <strong>ESCALATION_REQUIRED</strong><br />
                            Clinician pager triggered.
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-emerald-600">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="text-xs font-mono">
                            SYSTEM_ACTIVE <br />
                            Monitoring inputs.
                        </div>
                    </div>
                )}
            </div>
        </Panel>
    );
}
