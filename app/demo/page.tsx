"use client";

import { useState } from "react";
import { TriageChat } from "@/components/demo/triage-chat";
import { RiskMonitor } from "@/components/demo/risk-monitor";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { CrisisBanner } from "@/components/demo/crisis-banner";
import { PreChatForm, PreChatData } from "@/components/demo/pre-chat-form";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw } from "lucide-react";

export default function DemoPage() {
    const [riskScore, setRiskScore] = useState(10);
    const [analysis, setAnalysis] = useState("Awaiting clinical data...");
    const [sessionKey, setSessionKey] = useState(0);
    const [showPreChat, setShowPreChat] = useState(true);
    const [patientContext, setPatientContext] = useState<PreChatData | null>(null);

    const handleReset = () => {
        setSessionKey(prev => prev + 1);
        setRiskScore(10);
        setAnalysis("Awaiting clinical data...");
        setShowPreChat(true);
        setPatientContext(null);
    };

    const handlePreChatSubmit = (data: PreChatData) => {
        setPatientContext(data);
        setShowPreChat(false);
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <Navbar />
            <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
                {/* Header Control Panel */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold tracking-tight uppercase font-mono">
                            Clinical_Interface
                        </h1>
                        <Badge variant="outline" className="font-mono text-xs">LIVE_DEMO</Badge>
                        <div className="h-4 w-px bg-border mx-2" />
                        <span className="text-xs font-mono text-muted-foreground hidden sm:inline-block">
                            SESSION_ID: MB-{9921 + sessionKey}
                        </span>
                    </div>

                    <Button variant="outline" size="sm" onClick={handleReset} className="font-mono text-xs gap-2">
                        <RefreshCcw className="h-3 w-3" />
                        RESET_SESSION
                    </Button>
                </div>

                {showPreChat ? (
                    <div className="max-w-xl mx-auto py-12">
                        <PreChatForm onSubmit={handlePreChatSubmit} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-border shadow-sm rounded-lg overflow-hidden bg-card">

                        {/* Left: Chat Transcript (8 cols) */}
                        <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-border">
                            <TriageChat
                                key={sessionKey}
                                onAnalysisUpdate={(s, a) => {
                                    setRiskScore(s);
                                    setAnalysis(a);
                                }}
                                patientContext={patientContext}
                            />
                        </div>

                        {/* Right: Risk Monitor (4 cols) */}
                        <div className="lg:col-span-4 bg-muted/5">
                            <RiskMonitor key={sessionKey} score={riskScore} analysis={analysis} />
                        </div>
                    </div>
                )}

                {/* Crisis Interrupt Layer */}
                {riskScore >= 70 && !showPreChat && (
                    <div className="mt-4">
                        <CrisisBanner />
                    </div>
                )}
            </main>
        </div>
    );
}
