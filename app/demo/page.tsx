"use client";

import { useCallback, useState } from "react";
import { TriageChat } from "@/components/demo/triage-chat";
import { RiskMonitor } from "@/components/demo/risk-monitor";
import { Button } from "@/components/ui/button";
import { CrisisBanner } from "@/components/demo/crisis-banner";
import { PreChatForm, PreChatData } from "@/components/demo/pre-chat-form";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

export default function DemoPage() {
    const [riskScore, setRiskScore] = useState<number | null>(null);
    const [analysis, setAnalysis] = useState("No data yet.");
    const [sessionKey, setSessionKey] = useState(0);
    const [showPreChat, setShowPreChat] = useState(true);
    const [patientContext, setPatientContext] = useState<PreChatData | null>(null);

    const handleReset = () => {
        setSessionKey(prev => prev + 1);
        setRiskScore(null);
        setAnalysis("No data yet.");
        setShowPreChat(true);
        setPatientContext(null);
    };

    const handleAnalysisUpdate = useCallback((score: number | null, analysisText: string) => {
        setRiskScore(score);
        setAnalysis(analysisText);
    }, []);

    const handlePreChatSubmit = (data: PreChatData) => {
        setPatientContext(data);
        setShowPreChat(false);
    };

    return (
        <PageShell showFooter={false} containerClassName="max-w-none px-0" mainClassName="py-6">
            <div className="page-container space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold">Live demo</h1>
                        <Badge variant="outline" className="text-xs">Demo session</Badge>
                    </div>

                    <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                        <RefreshCcw className="h-3 w-3" />
                        Reset session
                    </Button>
                </div>

                {showPreChat ? (
                    <div className="max-w-xl">
                        <PreChatForm onSubmit={handlePreChatSubmit} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-[var(--radius)] border border-border bg-card">
                        <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-border">
                            <TriageChat
                                key={sessionKey}
                                onAnalysisUpdate={handleAnalysisUpdate}
                                patientContext={patientContext}
                            />
                        </div>
                        <div className="lg:col-span-4 bg-muted/20">
                            <RiskMonitor key={sessionKey} score={riskScore} analysis={analysis} />
                        </div>
                    </div>
                )}

                {riskScore !== null && riskScore >= 70 && !showPreChat && (
                    <CrisisBanner />
                )}
            </div>
        </PageShell>
    );
}
