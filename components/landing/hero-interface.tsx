"use client";

import { Panel } from "@/components/ui/panel";
import { Activity, Brain, Shield } from "lucide-react";

export function HeroInterface() {
    return (
        <div className="relative w-full max-w-[1000px] mx-auto mt-12 lg:mt-20 px-4">
            <Panel className="relative overflow-hidden border-border bg-card shadow-sm rounded-xl h-[400px] flex">
                {/* Sidebar */}
                <div className="w-64 border-r border-border bg-muted/20 hidden md:block p-4 space-y-4">
                    <div className="h-8 w-24 bg-muted/20 rounded animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-8 w-full bg-primary/10 rounded border-l-2 border-primary" />
                        <div className="h-8 w-full bg-transparent rounded" />
                        <div className="h-8 w-full bg-transparent rounded" />
                    </div>
                </div>

                {/* Main */}
                <div className="flex-1 p-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-border pb-4">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-emerald-500" />
                                <span className="text-sm font-mono text-muted-foreground">Vitals: Normal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Brain className="h-4 w-4 text-primary" />
                                <span className="text-sm font-mono text-muted-foreground">Cognition: Stable</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <Shield className="h-3 w-3 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-600">HIPAA Compliant</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-32 bg-muted/10 rounded border border-border dashed border-dashed animate-pulse text-xs font-mono text-muted-foreground flex items-center justify-center">
                            DATA_VISUALIZATION_A
                        </div>
                        <div className="h-32 bg-muted/10 rounded border border-border dashed border-dashed animate-pulse text-xs font-mono text-muted-foreground flex items-center justify-center">
                            DATA_VISUALIZATION_B
                        </div>
                    </div>

                    <div className="h-24 bg-muted/5 rounded border border-border p-4">
                        <div className="text-xs text-muted-foreground font-mono mb-2">CLINICAL_NOTES_PREVIEW</div>
                        <div className="space-y-2">
                            <div className="h-2 w-3/4 bg-muted/20 rounded" />
                            <div className="h-2 w-1/2 bg-muted/20 rounded" />
                        </div>
                    </div>
                </div>
            </Panel>
        </div>
    );
}
