"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { SkeletonCard, SkeletonTable } from "@/components/ui/skeleton";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TriageInterface } from "@/components/demo/triage-interface";

export default function DesignSystemPage() {
    return (
        <DashboardShell>
            <div className="space-y-12 pb-20">
                <div>
                    <h1 className="text-4xl font-bold font-mono uppercase tracking-tight">Design_System</h1>
                    <p className="text-muted-foreground mt-2">Core components and visual language for the MindBridge Clinical OS.</p>
                </div>

                {/* Typography */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold font-mono uppercase border-b pb-2">01_Typography</h2>
                    <div className="grid gap-6">
                        <div className="space-y-1">
                            <p className="text-xs font-mono text-muted-foreground">Heading 1</p>
                            <h1 className="text-4xl font-bold uppercase tracking-tight">Clinical Intelligence</h1>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-mono text-muted-foreground">Heading 2</p>
                            <h2 className="text-2xl font-bold">Patient Risk Stratification</h2>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-mono text-muted-foreground">Body Text</p>
                            <p className="text-base text-muted-foreground">The AI agent assesses risk across multiple clinical dimensions including intent, history, and current symptoms.</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-mono text-muted-foreground">Technical Monospace</p>
                            <p className="font-mono text-sm uppercase">SESSION_ID: 8f44-426a-94c9-62ccc8401d00</p>
                        </div>
                    </div>
                </section>

                {/* Buttons */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold font-mono uppercase border-b pb-2">02_Interactive_Controls</h2>
                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Button Variants</h3>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="default">DEFAULT</Button>
                                <Button variant="technical">TECHNICAL</Button>
                                <Button variant="action">ACTION</Button>
                                <Button variant="outline">OUTLINE</Button>
                                <Button variant="ghost">GHOST</Button>
                                <Button variant="destructive">DESTRUCTIVE</Button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Button Sizes</h3>
                            <div className="flex flex-wrap items-center gap-3">
                                <Button size="sm">SMALL</Button>
                                <Button size="default">DEFAULT</Button>
                                <Button size="lg">LARGE</Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Indicators */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold font-mono uppercase border-b pb-2">03_Indicators_and_Badges</h2>
                    <div className="flex flex-wrap gap-4">
                        <div className="space-y-2">
                            <p className="text-[10px] font-mono uppercase text-muted-foreground">Risk_Bands</p>
                            <div className="flex gap-2">
                                <Badge variant="riskHigh">9.8 • CRITICAL</Badge>
                                <Badge variant="riskModerate">5.2 • MODERATE</Badge>
                                <Badge variant="riskLow">1.4 • STABLE</Badge>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-mono uppercase text-muted-foreground">Standard_Badges</p>
                            <div className="flex gap-2">
                                <Badge variant="default">Active</Badge>
                                <Badge variant="secondary">Archive</Badge>
                                <Badge variant="outline">Draft</Badge>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Layout Primitives */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold font-mono uppercase border-b pb-2">04_Layout_and_Containers</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <p className="text-[10px] font-mono uppercase text-muted-foreground">Standard Panel</p>
                            <Panel className="p-6">
                                <p className="text-sm">Standard container for clinical data. Uses precise borders and high contrast for readability.</p>
                            </Panel>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-mono uppercase text-muted-foreground">Subtle Panel</p>
                            <Panel variant="subtle" className="p-6">
                                <p className="text-sm">Used for background information or less critical sections of the workspace.</p>
                            </Panel>
                        </div>
                    </div>
                </section>

                {/* Loading States */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold font-mono uppercase border-b pb-2">05_Loading_States</h2>
                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="space-y-4">
                            <p className="text-[10px] font-mono uppercase text-muted-foreground">Skeleton Card</p>
                            <SkeletonCard />
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] font-mono uppercase text-muted-foreground">Skeleton Table</p>
                            <SkeletonTable />
                        </div>
                    </div>
                </section>

                {/* Complex UI Patterns */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold font-mono uppercase border-b pb-2">06_Compound_Components</h2>
                    <div className="space-y-2">
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Triage Interface (Mocked)</p>
                        <TriageInterface
                            messages={[
                                { role: "assistant", content: "Intake session initialized.", timestamp: "12:00:01" },
                                { role: "user", content: "I've been feeling very stressed lately.", timestamp: "12:00:15" },
                                { role: "assistant", content: "I understand. Stress can be overwhelming. Can you tell me more about what's triggering this?", timestamp: "12:00:20" }
                            ]}
                            isLoading={false}
                            error={null}
                            className="max-w-2xl h-[400px]"
                        >
                            <TriageInterface.Header title="SHOWCASE_SESSION" />
                            <TriageInterface.Log />
                            <TriageInterface.Input 
                                value="" 
                                onChange={() => {}} 
                                onSubmit={(e) => e.preventDefault()}
                                placeholder="Documentation only..." 
                            />
                        </TriageInterface>
                    </div>
                </section>
            </div>
        </DashboardShell>
    );
}
