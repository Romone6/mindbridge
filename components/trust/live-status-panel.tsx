'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TableRLSStatus {
    tableName: string;
    rlsEnabled: boolean;
    policiesCount: number;
    lastChecked: string;
}

interface ComplianceStatus {
    overall: 'healthy' | 'warning' | 'critical';
    tables: TableRLSStatus[];
    lastChecked: string;
    uptime: string;
    encryptionEnabled: boolean | null;
    databaseStatus: 'operational' | 'degraded' | 'down';
    issues: string[];
    summary: {
        label: string;
        color: string;
        icon: 'check' | 'warning' | 'error';
    };
}

export default function LiveStatusPanel() {
    const [status, setStatus] = useState<ComplianceStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStatus = async () => {
        setLoading(true);
        setError(null);
        try {
            const complianceResponse = await fetch('/api/compliance/status');
            const complianceData = await complianceResponse.json();

            const healthResponse = await fetch('/api/health');
            const healthData = await healthResponse.json();

            setStatus({
                ...complianceData,
                uptime: healthData.uptime || "No data yet",
                databaseStatus: healthData.services?.database === 'healthy' ? 'operational' : 'degraded',
                issues: [
                    ...complianceData.issues,
                    ...(healthData.status !== 'healthy' ? ['System health check failed'] : [])
                ]
            });
        } catch (err) {
            setError('Unable to fetch status');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (icon: 'check' | 'warning' | 'error') => {
        switch (icon) {
            case 'check':
                return <CheckCircle className="w-4 h-4 text-emerald-600" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-amber-600" />;
            case 'error':
                return <XCircle className="w-4 h-4 text-red-600" />;
        }
    };

    if (loading && !status) {
        return (
            <Panel className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-48 mb-6" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="rounded-[var(--radius)] border border-border bg-muted/20 p-4 h-20" />
                    ))}
                </div>
            </Panel>
        );
    }

    if (error) {
        return (
            <Panel className="p-6">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="link" size="sm" className="mt-2 px-0" onClick={fetchStatus}>
                    Try again
                </Button>
            </Panel>
        );
    }

    if (!status) return null;

    const hasTableData = status.tables.length > 0;
    const encryptionValue =
        status.encryptionEnabled === null ? "No data yet" : status.encryptionEnabled ? "Enabled" : "Disabled";

    return (
        <Panel className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">Live system status</h2>
                    {getStatusIcon(status.summary.icon)}
                    <span className="text-xs text-muted-foreground">{status.summary.label}</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchStatus}
                    disabled={loading}
                    aria-label="Refresh status"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatusCard label="API uptime" value={status.uptime} />
                <StatusCard
                    label="Database"
                    value={status.databaseStatus.charAt(0).toUpperCase() + status.databaseStatus.slice(1)}
                />
                <StatusCard label="Encryption" value={encryptionValue} />
                <StatusCard label="Last check" value={new Date(status.lastChecked).toLocaleTimeString()} />
            </div>

            <div className="rounded-[var(--radius)] border border-border overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                    <h3 className="text-sm font-semibold">Row level security status</h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Table</TableHead>
                            <TableHead>RLS enabled</TableHead>
                            <TableHead>Policies</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {hasTableData ? (
                            status.tables.map(table => (
                                <TableRow key={table.tableName}>
                                    <TableCell className="font-mono text-xs">{table.tableName}</TableCell>
                                    <TableCell>
                                        {table.rlsEnabled ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-600 inline" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-600 inline" />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{table.policiesCount}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground h-16">
                                    No data yet
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {status.issues.length > 0 && (
                <div className="rounded-[var(--radius)] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    <h3 className="font-semibold mb-2">Issues detected</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {status.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                        ))}
                    </ul>
                </div>
            )}
        </Panel>
    );
}

function StatusCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-[var(--radius)] border border-border bg-muted/20 p-4">
            <div className="text-xs text-muted-foreground mb-1">{label}</div>
            <div className="text-sm font-semibold text-foreground">{value}</div>
        </div>
    );
}
