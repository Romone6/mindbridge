'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ClipboardCheck, Shield, AlertCircle } from 'lucide-react';

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
    internal: { label: 'Internal', color: 'bg-blue-100 text-blue-800', icon: <ClipboardCheck className="w-4 h-4" /> },
    external: { label: 'External', color: 'bg-purple-100 text-purple-800', icon: <Shield className="w-4 h-4" /> },
    penetration_test: { label: 'Pen Test', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4" /> },
    soc2: { label: 'SOC 2', color: 'bg-green-100 text-green-800', icon: <Shield className="w-4 h-4" /> },
    hipaa: { label: 'HIPAA', color: 'bg-teal-100 text-teal-800', icon: <Shield className="w-4 h-4" /> },
    gdpr: { label: 'GDPR', color: 'bg-indigo-100 text-indigo-800', icon: <Shield className="w-4 h-4" /> },
    iso27001: { label: 'ISO 27001', color: 'bg-orange-100 text-orange-800', icon: <Shield className="w-4 h-4" /> }
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
            <div className="border-t pt-10 mb-12">
                <h2 className="text-2xl font-bold mb-6">Upcoming Audits</h2>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-100 rounded-lg p-4 h-24" />
                    ))}
                </div>
            </div>
        );
    }

    if (audits.length === 0) {
        return null;
    }

    // Filter to only show upcoming audits
    const upcomingAudits = audits.filter(a =>
        a.status === 'scheduled' || a.status === 'in_progress'
    );

    if (upcomingAudits.length === 0) {
        return null;
    }

    return (
        <div className="border-t pt-10 mb-12">
            <h2 className="text-2xl font-bold mb-6">Upcoming Audits</h2>
            <div className="space-y-4">
                {upcomingAudits.map(audit => {
                    const config = auditTypeConfig[audit.audit_type] || auditTypeConfig.internal;
                    const date = new Date(audit.scheduled_date);

                    return (
                        <div
                            key={audit.id}
                            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                                            {config.icon}
                                            <span>{config.label}</span>
                                        </span>
                                        {audit.status === 'in_progress' && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                In Progress
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-gray-900">{audit.title}</h3>
                                    {audit.description && (
                                        <p className="text-sm text-gray-600 mt-1">{audit.description}</p>
                                    )}
                                    {audit.auditor_org && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            By: {audit.auditor_name} ({audit.auditor_org})
                                        </p>
                                    )}
                                </div>
                                <div className="text-right ml-4 flex-shrink-0">
                                    <div className="flex items-center text-gray-600 text-sm">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {date.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days away
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
