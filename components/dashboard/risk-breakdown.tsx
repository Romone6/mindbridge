"use client";

import { Panel } from "@/components/ui/panel";
import { Target } from "lucide-react";

interface RiskBreakdownProps {
    riskScore: number;
    riskBand: "Critical" | "High" | "Moderate" | "Low";
    phq9Score?: number;
    gad7Score?: number;
    riskPhraseCount: number;
}

export function RiskBreakdown({
    riskScore,
    riskBand,
    phq9Score,
    gad7Score
}: RiskBreakdownProps) {
    return (
        <Panel className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Risk Stratification
            </h3>

            <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Overall Risk Score</span>
                        <span className="font-mono font-medium">{riskScore}/100</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                            className={`h-full ${riskBand === 'Critical' ? 'bg-red-500' : riskBand === 'High' ? 'bg-orange-500' : riskBand === 'Moderate' ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                            style={{ width: `${riskScore}%` }}
                        />
                    </div>
                </div>

                {gad7Score !== undefined && (
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Anxiety (GAD-7)</span>
                            <span className="font-mono font-medium text-amber-500">
                                {gad7Score >= 15 ? "Severe" : gad7Score >= 10 ? "Moderate" : gad7Score >= 5 ? "Mild" : "None"} ({gad7Score})
                            </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${(gad7Score / 21) * 100}%` }} />
                        </div>
                    </div>
                )}

                {phq9Score !== undefined && (
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Depression (PHQ-9)</span>
                            <span className="font-mono font-medium text-rose-500">
                                {phq9Score >= 20 ? "Severe" : phq9Score >= 15 ? "Mod. Severe" : phq9Score >= 10 ? "Moderate" : phq9Score >= 5 ? "Mild" : "None"} ({phq9Score})
                            </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500" style={{ width: `${(phq9Score / 27) * 100}%` }} />
                        </div>
                    </div>
                )}
            </div>
        </Panel>
    );
}
