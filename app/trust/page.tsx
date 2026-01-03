import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, FileText, CheckCircle } from 'lucide-react';

import LiveStatusPanel from '@/components/trust/live-status-panel';
import UpcomingAudits from '@/components/trust/upcoming-audits';
import { PageShell } from '@/components/layout/page-shell';
import { Panel } from '@/components/ui/panel';

export default function TrustCenter() {
    return (
        <PageShell>
            <div className="space-y-8">
                <div className="text-center space-y-3">
                    <h1>Trust center</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Monitor our security posture, compliance status, and data protection policies.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {[
                        {
                            title: "Security",
                            description: "Encryption, role-based access, and continuous monitoring controls.",
                            icon: ShieldCheck,
                            status: "SOC 2 program in progress",
                        },
                        {
                            title: "Privacy",
                            description: "Data minimization and HIPAA-aligned handling practices.",
                            icon: Lock,
                            status: "Privacy controls documented",
                        },
                        {
                            title: "Compliance",
                            description: "Policies and operational safeguards aligned with healthcare standards.",
                            icon: FileText,
                            status: "Compliance roadmap active",
                        },
                    ].map((item) => (
                        <Panel key={item.title} className="p-6 space-y-3">
                            <div className="flex items-center gap-3">
                                <item.icon className="w-6 h-6 text-muted-foreground" />
                                <h2 className="text-lg font-semibold">{item.title}</h2>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                {item.status}
                            </div>
                        </Panel>
                    ))}
                </div>

                <LiveStatusPanel />

                <div className="border-t border-border pt-8">
                    <h2 className="text-2xl font-bold mb-6">Resources</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Link href="/legal/privacy" className="block rounded-[var(--radius)] border border-border p-4 hover:bg-muted/30 transition">
                            <h3 className="font-semibold text-lg mb-1">Privacy policy</h3>
                            <p className="text-muted-foreground text-sm">Read how we handle your data.</p>
                        </Link>
                        <Link href="/legal/terms" className="block rounded-[var(--radius)] border border-border p-4 hover:bg-muted/30 transition">
                            <h3 className="font-semibold text-lg mb-1">Terms of service</h3>
                            <p className="text-muted-foreground text-sm">Understand your rights and responsibilities.</p>
                        </Link>
                    </div>
                </div>

                <UpcomingAudits />
            </div>
        </PageShell>
    );
}
