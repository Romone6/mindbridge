"use client";

import { useState } from "react";
import { TriageChat } from "@/components/demo/triage-chat";
import { RiskMonitor } from "@/components/demo/risk-monitor";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DemoPage() {
    const [riskScore, setRiskScore] = useState(10);
    const [analysis, setAnalysis] = useState("Initializing session...");

    return (
        <main className="min-h-screen bg-background p-4 md:p-8 flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Clinical Interface <span className="text-primary text-sm font-normal ml-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">DEMO</span></h1>
                        <p className="text-sm text-muted-foreground">Live Patient Triage Session #MB-9921</p>
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <div className="flex-1 grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
                {/* Left: Chat Interface (2 cols) */}
                <div className="lg:col-span-2">
                    <TriageChat onAnalysisUpdate={(s, a) => {
                        setRiskScore(s);
                        setAnalysis(a);
                    }} />
                </div>

                {/* Right: Risk Monitor (1 col) */}
                <div className="lg:col-span-1 h-[600px]">
                    <RiskMonitor score={riskScore} analysis={analysis} />
                </div>
            </div>
        </main>
    );
}
