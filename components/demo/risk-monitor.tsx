"use client";

import { Panel } from "@/components/ui/panel";
import { Activity, ShieldAlert, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface RiskMonitorProps {
    score: number | null;
    analysis: string;
}

export function RiskMonitor({ score, analysis = "No data yet." }: RiskMonitorProps) {
    const hasScore = typeof score === "number";
    const getRiskLevel = (s: number) => {
        if (s < 30) return "LOW";
        if (s < 70) return "MODERATE";
        return "HIGH";
    };

    const riskLevel = hasScore ? getRiskLevel(score) : "NO DATA";
    const riskLabel = hasScore ? riskLevel : "No data";
    const riskVariant = !hasScore
        ? "outline"
        : riskLevel === "LOW"
          ? "riskLow"
          : riskLevel === "MODERATE"
            ? "riskModerate"
            : "riskHigh";
    const numericScore = hasScore ? score : 0;
    const normalizedScore = Math.min(100, Math.max(0, numericScore));

    return (
        <Panel className="h-full flex flex-col overflow-hidden border-l border-border rounded-none md:rounded-r-[var(--radius)] shadow-none">
            <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        Risk monitor
                    </div>
                    <Badge variant={riskVariant} className="text-[10px] uppercase">
                        {riskLabel}
                    </Badge>
                </div>
            </div>

            <div className="p-6 space-y-6">
                <div className="text-center p-5 border border-border bg-muted/10 rounded-[var(--radius)]">
                    <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Composite score</div>
                    <div className="text-3xl font-semibold text-foreground">
                        {hasScore ? score : "No data yet"}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Low</span>
                        <span>High</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className={`h-full ${!hasScore ? 'bg-muted-foreground/30' : numericScore > 70 ? 'bg-red-500' : numericScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${normalizedScore}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
                        <Cpu className="h-4 w-4" />
                        Analysis
                    </div>
                    <div className="p-4 border border-border bg-muted/10 rounded-[var(--radius)] min-h-[120px] text-xs leading-relaxed text-muted-foreground">
                        {analysis ? (
                            <motion.div key={analysis} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {analysis}
                            </motion.div>
                        ) : (
                            <span className="animate-pulse">No data yet</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-auto p-4 border-t border-border bg-muted/30">
                {hasScore && numericScore > 70 ? (
                    <div className="flex items-center gap-3 text-red-600 text-xs">
                        <ShieldAlert className="h-5 w-5" />
                        Escalation required. Clinician review recommended.
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-emerald-600 text-xs">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        {hasScore ? "Monitoring inputs." : "Awaiting inputs."}
                    </div>
                )}
            </div>
        </Panel>
    );
}
