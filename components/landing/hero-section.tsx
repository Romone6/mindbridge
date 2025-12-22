"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
    return (
        <section className="relative w-full border-b border-border bg-background pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden">
            {/* Series D Mesh Gradient Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-40 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full"></div>
                <div className="absolute top-[10%] right-[-10%] w-[35%] h-[35%] bg-purple-500/15 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[20%] left-[20%] w-[30%] h-[30%] bg-emerald-500/10 blur-[80px] rounded-full"></div>
            </div>

            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Left Column: Typography Statement */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider py-1">
                            System Status: Operational
                        </Badge>
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-foreground leading-[1.05] mb-8 lg:-ml-1">
                            Patient intake<br />
                            that feels<br />
                            <span className="text-primary/90">like care</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed font-medium">
                            MindBridge orchestrates clinical risk assessment with human warmth.
                            Built for health systems that prioritize safety and scale.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link href="/demo">
                            <Button size="lg" className="rounded-full h-14 px-10 text-base font-semibold border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2">
                                See it in action <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                            <span>v2.4.0</span>
                            <span>-</span>
                            <span>HIPAA_COMPLIANT</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Code/Log Viz (The "Proof") */}
                <div className="hidden lg:block relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative border border-border/50 bg-card/60 backdrop-blur-3xl p-10 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-500 group-hover:translate-y-[-4px]">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-400/40"></div>
                                <div className="h-3 w-3 rounded-full bg-amber-400/40"></div>
                                <div className="h-3 w-3 rounded-full bg-emerald-400/40"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <Badge variant="secondary" className="rounded-full text-[10px] uppercase font-bold tracking-widest px-3 bg-secondary/80 border-border/50 text-muted-foreground">
                                    Live Stream
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 shadow-sm">
                                    <span className="text-2xl">MB</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-base font-bold text-foreground tracking-tight">Aiden M.</div>
                                    <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-2">
                                        Intake complete <span className="h-1 w-1 rounded-full bg-muted-foreground/50"></span> 2m ago
                                    </div>
                                </div>
                                <Badge className="ml-auto bg-rose-500/10 text-rose-600 border-rose-500/20 rounded-full font-bold px-4 py-1 text-xs">
                                    Elevated Risk
                                </Badge>
                            </div>

                            <div className="space-y-4 pl-16">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Clinical Sentiment</div>
                                        <div className="text-sm font-semibold">Distress detected</div>
                                    </div>
                                    <div className="text-xs font-mono font-bold text-primary">98% CONF</div>
                                </div>
                                <div className="h-2.5 w-full bg-muted/40 rounded-full overflow-hidden p-[2px]">
                                    <div className="h-full bg-gradient-to-r from-primary/60 to-primary w-[98%] rounded-full"></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pl-16">
                                <div className="p-4 rounded-2xl bg-muted/10 border border-border/40 hover:bg-muted/20 transition-colors">
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 font-bold">Priority Status</div>
                                    <div className="text-xs font-bold flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500"></div>
                                        P1: Immediate
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/10 border border-border/40 hover:bg-muted/20 transition-colors">
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 font-bold">Next Action</div>
                                    <div className="text-xs font-bold flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                        Clinician Alerted
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10"></div>
        </section>
    );
}
