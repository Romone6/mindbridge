"use client";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { ArrowLeft, Download, FileText, Newspaper } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PageShell } from "@/components/layout/page-shell";

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
        <PageShell>
            <div className="space-y-10">
                <div>
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
                        </Button>
                    </Link>
                    <h1>Clinical evidence</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Documentation, methodology, and safety practices that inform the MindBridge workflow.
                    </p>
                </div>

                <section>
                    <Panel className="p-8 md:p-10 space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" /> Whitepaper
                        </div>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="space-y-4 max-w-2xl">
                                <h2 className="text-2xl font-semibold">MindBridge clinical overview</h2>
                                <p className="text-muted-foreground">
                                    We are preparing a clinical overview that documents the intake workflow, safety checks, and configuration options.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button size="lg" variant="outline" disabled>
                                        Download PDF <Download className="ml-2 h-4 w-4" />
                                    </Button>
                                    <div className="text-xs text-muted-foreground">
                                        No data yet. Publication details will appear here.
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-1/3 aspect-[3/4] bg-muted/20 border border-border rounded-[var(--radius)] relative overflow-hidden">
                                <Image
                                    src="/docs/whitepaper-abstract.png"
                                    alt="Whitepaper preview"
                                    fill
                                    className="object-cover opacity-80"
                                />
                            </div>
                        </div>
                    </Panel>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Newspaper className="h-6 w-6 text-muted-foreground" />
                        <h2 className="text-2xl font-bold">Research highlights</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {highlights.map((item) => (
                            <Panel key={item.title} className="p-6">
                                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                                <Link href={item.href} className="text-xs font-semibold text-primary hover:underline">
                                    {item.cta}
                                </Link>
                            </Panel>
                        ))}
                    </div>
                </section>
            </div>
        </PageShell>
    );
}
