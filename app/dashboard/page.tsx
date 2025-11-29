import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCards } from "@/components/dashboard/stat-cards";
import { PatientQueue } from "@/components/dashboard/patient-queue";

export default function DashboardPage() {
    return (
        <DashboardShell>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
                    <p className="text-muted-foreground">
                        Real-time insights and patient triage status.
                    </p>
                </div>

                <StatCards />
                <PatientQueue />
            </div>
        </DashboardShell>
    );
}
