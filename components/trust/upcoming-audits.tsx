'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ClipboardCheck, Shield, AlertCircle } from 'lucide-react';
import { Panel } from '@/components/ui/panel';

interface Audit {
    id: string;
    audit_type: 'internal' | 'external' | 'penetration_test' | 'soc2' | 'hipaa' | 'gdpr' | 'iso27001';
    title: string;
    description: string | null;
    scheduled_date: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    auditor_name: string | null;
    auditor_org: string | null;
}

const auditTypeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    internal: { label: 'Internal', color: 'bg-muted/40 text-muted-foreground', icon: <ClipboardCheck className="w-4 h-4" /> },
    external: { label: 'External', color: 'bg-muted/40 text-muted-foreground', icon: <Shield className="w-4 h-4" /> },
    penetration_test: { label: 'Pen Test', color: 'bg-rose-100 text-rose-700', icon: <AlertCircle className="w-4 h-4" /> },
    soc2: { label: 'SOC 2', color: 'bg-muted/40 text-muted-foreground', icon: <Shield className="w-4 h-4" /> },
    hipaa: { label: 'HIPAA', color: 'bg-muted/40 text-muted-foreground', icon: <Shield className="w-4 h-4" /> },
    gdpr: { label: 'GDPR', color: 'bg-muted/40 text-muted-foreground', icon: <Shield className="w-4 h-4" /> },
    iso27001: { label: 'ISO 27001', color: 'bg-muted/40 text-muted-foreground', icon: <Shield className="w-4 h-4" /> }
};

export default function UpcomingAudits() {
    const [audits, setAudits] = useState<Audit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAudits() {
            try {
                const response = await fetch('/api/compliance/audits');
                if (response.ok) {
                    const data = await response.json();
                    setAudits(data.audits);
                }
            } catch (error) {
                console.error('Failed to fetch audits:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchAudits();
    }, []);

    if (loading) {
        return (
            <div className="border-t border-border pt-10">
                <h2 className="text-2xl font-bold mb-6">Upcoming audits</h2>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-muted/30 rounded-[var(--radius)] p-4 h-24" />
                    ))}
                </div>
            </div>
        );
    }

    if (audits.length === 0) {
        return (
            <div className="border-t border-border pt-10">
                <h2 className="text-2xl font-bold mb-6">Upcoming audits</h2>
                <Panel className="p-4 text-sm text-muted-foreground">
                    No audit schedule published yet.
                </Panel>
            </div>
        );
    }

    // Filter to only show upcoming audits
    const upcomingAudits = audits.filter(a =>
        a.status === 'scheduled' || a.status === 'in_progress'
    );

    if (upcomingAudits.length === 0) {
        return (
            <div className="border-t border-border pt-10">
                <h2 className="text-2xl font-bold mb-6">Upcoming audits</h2>
                <Panel className="p-4 text-sm text-muted-foreground">
                    No upcoming audits scheduled yet.
                </Panel>
            </div>
        );
    }

        return (
        <div className="border-t border-border pt-10">
            <h2 className="text-2xl font-bold mb-6">Upcoming audits</h2>
            <div className="space-y-4">
                {upcomingAudits.map(audit => {
                    const config = auditTypeConfig[audit.audit_type] || auditTypeConfig.internal;
                    const date = new Date(audit.scheduled_date);

                    return (
                        <Panel key={audit.id} className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                                            {config.icon}
                                            <span>{config.label}</span>
                                        </span>
                                        {audit.status === 'in_progress' && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                In progress
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-foreground">{audit.title}</h3>
                                    {audit.description && (
                                        <p className="text-sm text-muted-foreground mt-1">{audit.description}</p>
                                    )}
                                    {audit.auditor_org && (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            By: {audit.auditor_name} ({audit.auditor_org})
                                        </p>
                                    )}
                                </div>
                                <div className="text-right ml-4 flex-shrink-0 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {date.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days away
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    );
                })}
            </div>
        </div>
    );
}
