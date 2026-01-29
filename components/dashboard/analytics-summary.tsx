"use client";

import { Panel } from "@/components/ui/panel";
import { TrendingUp, Users, Clock, Loader2 } from "lucide-react";
import { useClinic } from "@/components/providers/clinic-provider";
import { useState, useEffect } from "react";

interface AnalyticsData {
    totalTriage: number;
    activePatients: number;
    avgResponse?: string | null;
}

export function AnalyticsSummary() {
    const { currentClinic } = useClinic();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!currentClinic) return;

        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/analytics?clinicId=${currentClinic.id}`);
                const payload = await response.json();
                if (!response.ok) throw new Error(payload.error || "Failed to fetch analytics");

                setData(payload);
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [currentClinic]);

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <Panel key={i} className="p-6">
                        <div className="flex items-center justify-center h-20">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    </Panel>
                ))}
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Panel className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Triage</p>
                        <h3 className="text-2xl font-bold font-mono">{data.totalTriage.toLocaleString()}</h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">Historical comparisons: No data yet.</div>
            </Panel>

            <Panel className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                        <h3 className="text-2xl font-bold font-mono">{data.activePatients.toLocaleString()}</h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <Users className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">Historical comparisons: No data yet.</div>
            </Panel>

            <Panel className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                        <h3 className="text-2xl font-semibold">{data.avgResponse || "No data yet"}</h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <Clock className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">Response timing will appear after activity.</div>
            </Panel>
        </div>
    );
}
