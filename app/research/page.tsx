"use client";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { ArrowLeft, Download, FileText, Newspaper } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PageShell } from "@/components/layout/page-shell";

const updates = [
    {
        title: "Upcoming: Clinical outcomes study",
        description: "We are preparing a pilot outcomes report focused on intake completion rates.",
    },
    {
        title: "Upcoming: Risk workflow validation",
        description: "Evaluation of risk signal sensitivity across clinic cohorts.",
    },
    {
        title: "Upcoming: Implementation briefing",
        description: "How clinical teams can configure escalation policies and audit trails.",
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
                                    Documentation covering intake structure, safety checks, and configuration options for clinical teams.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button asChild size="lg" variant="outline">
                                        <Link href="/docs/mindbridge_whitepaper.pdf" target="_blank" rel="noreferrer">
                                            Download PDF <Download className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <div className="text-xs text-muted-foreground">
                                        Updated regularly as new evidence is published.
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-1/3 aspect-[3/4] bg-white border border-border rounded-[var(--radius)] relative overflow-hidden">
                                <Image
                                    src="/docs/whitepaper-abstract.png"
                                    alt="Whitepaper preview"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </Panel>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <Newspaper className="h-6 w-6 text-muted-foreground" />
                        <h2 className="text-2xl font-bold">Research updates</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {updates.map((item) => (
                            <Panel key={item.title} className="p-6">
                                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                                <span className="text-xs text-muted-foreground">No data yet.</span>
                            </Panel>
                        ))}
                    </div>
                </section>
            </div>
        </PageShell>
    );
}
