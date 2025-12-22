"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AnalyticsSummary } from "@/components/dashboard/analytics-summary";
import { PatientQueue } from "@/components/dashboard/patient-queue";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        // Simulate data fetching
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <DashboardShell>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Clinical Dashboard {user?.firstName && <span className="text-muted-foreground font-normal">- Welcome, Dr. {user.firstName}</span>}
                    </h2>
                    <p className="text-muted-foreground">
                        Real-time triage insights and patient management.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-dashed">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Spinner size="lg" />
                            <p>Loading clinical data...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <AnalyticsSummary />
                        <PatientQueue />
                    </>
                )}
            </div>
        </DashboardShell>
    );
}
