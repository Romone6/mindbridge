"use client";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { ArrowLeft, Download, FileText, Newspaper } from "lucide-react";
import Link from "next/link";

const highlights = [
    {
        title: "Methodology: Risk stratification",
        description: "How we combine deterministic rules and LLM reasoning for safety.",
        href: "/methodology",
        cta: "Read methodology",
    },
    {
        title: "Safety guardrails",
        description: "Clinical escalation, bias monitoring, and crisis handling.",
        href: "/safety",
        cta: "View safety",
    },
    {
        title: "Security and privacy",
        description: "Data handling, audit logging, and compliance posture.",
        href: "/legal/privacy",
        cta: "Privacy policy",
    },
];

export default function ResearchPage() {
    return (
        <main className="min-h-screen bg-background pt-20 pb-16">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="mb-12">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                        </Button>
                    </Link>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                        Clinical <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Evidence</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Our AI models are rigorously tested against standard clinical benchmarks.
                        We prioritize safety, efficacy, and transparency above all else.
                    </p>
                </div>

                {/* Whitepaper Section */}
                <section className="mb-20">
                    <Panel className="p-8 md:p-12 border-primary/20 bg-primary/5 relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                            <div className="space-y-4 max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                    <FileText className="h-3 w-3" /> Whitepaper v1.0
                                </div>
                                <h2 className="text-3xl font-bold">The MindBridge Efficacy Report</h2>
                                <p className="text-muted-foreground">
                                    A comprehensive analysis of our Triage Agent's performance compared to human clinicians
                                    across 500 simulated patient encounters. Includes detailed safety metrics and
                                    diagnostic accuracy comparisons.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                    <a href="/docs/mindbridge_whitepaper.pdf" download>
                                        <Button size="lg" className="w-full sm:w-auto">
                                            Download PDF <Download className="ml-2 h-4 w-4" />
                                        </Button>
                                    </a>
                                    <div className="text-xs text-muted-foreground flex items-center">
                                        *Published Nov 2025 - 24 Pages - PDF
                                    </div>
                                </div>
                            </div>

                            {/* Visual Abstract */}
                            <div className="w-full md:w-1/3 aspect-[3/4] bg-white/5 border border-white/10 rounded-lg flex items-center justify-center relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="text-center space-y-2">
                                    <FileText className="h-16 w-16 text-muted-foreground/60 mx-auto" />
                                    <div className="text-xs text-muted-foreground uppercase tracking-widest">Visual Abstract</div>
                                </div>
                            </div>
                        </div>
                    </Panel>
                </section>

                {/* Highlights Section */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <Newspaper className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">Research Highlights</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {highlights.map((item) => (
                            <Panel key={item.title} className="p-6 hover:bg-white/5 transition-colors group">
                                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {item.description}
                                </p>
                                <Link href={item.href} className="text-xs font-semibold text-primary hover:underline">
                                    {item.cta}
                                </Link>
                            </Panel>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
