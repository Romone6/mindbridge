'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

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
    encryptionEnabled: boolean;
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
            // Fetch compliance status (RLS)
            const complianceResponse = await fetch('/api/compliance/status');
            const complianceData = await complianceResponse.json();

            // Fetch real system health
            const healthResponse = await fetch('/api/health');
            const healthData = await healthResponse.json();

            // Merge data
            setStatus({
                ...complianceData,
                uptime: healthData.status === 'healthy' ? '100%' : 'Degraded',
                databaseStatus: healthData.services.database === 'healthy' ? 'operational' : 'degraded',
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
        // Refresh every 5 minutes
        const interval = setInterval(fetchStatus, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (icon: 'check' | 'warning' | 'error') => {
        switch (icon) {
            case 'check':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-600" />;
        }
    };

    if (loading && !status) {
        return (
            <div className="bg-gray-50 rounded-xl p-8 mb-12 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white p-4 rounded shadow-sm">
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                            <div className="h-6 bg-gray-200 rounded w-16" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 rounded-xl p-8 mb-12">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchStatus}
                    className="mt-4 text-sm text-red-700 underline hover:no-underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!status) return null;

    return (
        <div className="bg-gray-50 rounded-xl p-8 mb-12">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold">Live System Status</h2>
                    {getStatusIcon(status.summary.icon)}
                    <span className={`text-sm font-medium ${status.summary.color}`}>
                        {status.summary.label}
                    </span>
                </div>
                <button
                    onClick={fetchStatus}
                    disabled={loading}
                    className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                    title="Refresh status"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatusCard
                    label="API Uptime"
                    value={status.uptime}
                    color="text-green-600"
                />
                <StatusCard
                    label="Database"
                    value={status.databaseStatus.charAt(0).toUpperCase() + status.databaseStatus.slice(1)}
                    color={status.databaseStatus === 'operational' ? 'text-green-600' : 'text-yellow-600'}
                />
                <StatusCard
                    label="Encryption"
                    value={status.encryptionEnabled ? 'Enabled' : 'Disabled'}
                    color={status.encryptionEnabled ? 'text-green-600' : 'text-red-600'}
                />
                <StatusCard
                    label="Last Check"
                    value={new Date(status.lastChecked).toLocaleTimeString()}
                    color="text-blue-600"
                />
            </div>

            {/* RLS Status Table */}
            <div className="bg-white rounded-lg p-4">
                <h3 className="font-semibold mb-3 text-sm text-gray-700">Row Level Security Status</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 px-3 font-medium text-gray-600">Table</th>
                                <th className="text-center py-2 px-3 font-medium text-gray-600">RLS Enabled</th>
                                <th className="text-center py-2 px-3 font-medium text-gray-600">Policies</th>
                            </tr>
                        </thead>
                        <tbody>
                            {status.tables.map(table => (
                                <tr key={table.tableName} className="border-b last:border-0">
                                    <td className="py-2 px-3 font-mono text-gray-800">{table.tableName}</td>
                                    <td className="py-2 px-3 text-center">
                                        {table.rlsEnabled ? (
                                            <CheckCircle className="w-4 h-4 text-green-600 inline" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-600 inline" />
                                        )}
                                    </td>
                                    <td className="py-2 px-3 text-center text-gray-600">{table.policiesCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {status.issues.length > 0 && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">Issues Detected</h3>
                    <ul className="list-disc list-inside text-sm text-yellow-700">
                        {status.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function StatusCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="bg-white p-4 rounded shadow-sm">
            <div className="text-sm text-gray-500 mb-1">{label}</div>
            <div className={`text-lg font-bold ${color}`}>{value}</div>
        </div>
    );
}
