"use client";

import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, LayoutDashboard, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const DEMOS = [
    {
        title: "Empathetic Patient Intake",
        description: "A conversation that feels human. MindBridge conducts clinical interviews with warmth, ensuring patients feel heard from the first hello.",
        icon: MessageSquare,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        visual: (
            <div className="space-y-4">
                <div className="flex gap-2 max-w-[80%]">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs">AI</div>
                    <div className="p-3 rounded-2xl rounded-tl-none bg-muted text-xs leading-relaxed">
                        Hi Sarah, I'm here to help you get started. How have you been feeling over the last two weeks?
                    </div>
                </div>
                <div className="flex gap-2 max-w-[80%] ml-auto flex-row-reverse">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs">SM</div>
                    <div className="p-3 rounded-2xl rounded-tr-none bg-primary text-primary-foreground text-xs leading-relaxed">
                        I've been feeling really overwhelmed lately. It's hard to even get out of bed some days.
                    </div>
                </div>
                <div className="flex gap-2 max-w-[80%]">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs">AI</div>
                    <div className="p-3 rounded-2xl rounded-tl-none bg-muted text-xs leading-relaxed">
                        I'm sorry to hear that. It sounds really tough. Can you tell me more about what's been on your mind?
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "Instant Risk Stratification",
        description: "No more manual scoring. We instantly analyze intakes for risk factors, PHQ-9 scores, and clinical urgency, so you can prioritize those in need.",
        icon: Zap,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        visual: (
            <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Priority Alert</span>
                        <Badge className="bg-amber-500/20 text-amber-600 border-none rounded-full">High Urgency</Badge>
                    </div>
                    <div className="text-sm font-bold mb-1">Aiden M. (24y)</div>
                    <div className="text-[11px] text-muted-foreground mb-3 italic">"Feeling hopeless for 3+ weeks..."</div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-background/50 p-2 rounded-lg border border-border/50">
                            <div className="text-[9px] text-muted-foreground uppercase">PHQ-9 Score</div>
                            <div className="text-xs font-bold text-amber-600">19 (Severe)</div>
                        </div>
                        <div className="bg-background/50 p-2 rounded-lg border border-border/50">
                            <div className="text-[9px] text-muted-foreground uppercase">GAD-7 Score</div>
                            <div className="text-xs font-bold">14 (Moderate)</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "Clinical Decision Support",
        description: "Ready for review in seconds. MindBridge generates a concise clinical summary for your EHR, cutting down documentation time by 80%.",
        icon: LayoutDashboard,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        visual: (
            <div className="space-y-3">
                <div className="p-3 border-l-2 border-emerald-500 bg-emerald-500/5 rounded-r-lg">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase mb-1">AI Summary</div>
                    <p className="text-[11px] leading-relaxed text-foreground">
                        Patient presents with persistent low mood and sleep disturbance.
                        Clinical flags detected for anhedonia and social withdrawal.
                        Handoff ready for Intake Specialist.
                    </p>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg">
                    <div className="h-6 w-6 rounded flex items-center justify-center bg-emerald-500/20 text-emerald-600">
                        <Zap className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-medium">Synced to Clinician Dashboard</span>
                    <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
            </div>
        )
    }
];

export function MiniDemos() {
    return (
        <section className="w-full border-b border-border py-24 bg-background overflow-hidden">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-20 text-center">
                    <h2 className="text-xl font-semibold text-primary mb-4">The MindBridge Experience</h2>
                    <p className="text-3xl md:text-5xl font-bold text-foreground">See how it works.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {DEMOS.map((demo, index) => (
                        <Panel key={index} className="flex flex-col h-full overflow-hidden group hover:border-primary/50 transition-all duration-300">
                            <div className="p-8 pb-4">
                                <div className={`h-12 w-12 rounded-2xl ${demo.bg} flex items-center justify-center mb-6`}>
                                    <demo.icon className={`h-6 w-6 ${demo.color}`} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{demo.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                                    {demo.description}
                                </p>
                            </div>

                            <div className="mt-auto px-8 pb-8">
                                <div className="relative border border-border/50 bg-secondary/20 p-6 rounded-2xl shadow-inner min-h-[220px] flex flex-col justify-center">
                                    {demo.visual}
                                </div>
                            </div>
                        </Panel>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/demo">
                        <button className="inline-flex items-center gap-2 text-primary font-bold hover:underline group">
                            Explore the full clinical OS <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
