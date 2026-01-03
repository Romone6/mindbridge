import { Panel } from "@/components/ui/panel";
import { Users, Clock, AlertTriangle, Activity } from "lucide-react";

export function StatCards() {
    const stats = [
        {
            label: "ACTIVE_QUEUE",
            value: "No data yet",
            sub: "Awaiting activity",
            icon: Users,
            alert: false
        },
        {
            label: "HIGH_RISK",
            value: "No data yet",
            sub: "Awaiting activity",
            icon: AlertTriangle,
            alert: false
        },
        {
            label: "AVG_TRIAGE",
            value: "No data yet",
            sub: "Awaiting activity",
            icon: Clock,
            alert: false
        },
        {
            label: "SYS_ACCURACY",
            value: "No data yet",
            sub: "Awaiting activity",
            icon: Activity,
            alert: false
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            {stats.map((stat) => (
                <Panel key={stat.label} className="p-4 flex flex-col justify-between h-28 hover:border-primary transition-colors cursor-default">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {stat.label}
                        </span>
                        <stat.icon className={`h-4 w-4 ${stat.alert ? "text-red-500" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                        <div className={`text-2xl font-semibold tracking-tight ${stat.alert ? "text-red-600" : "text-foreground"}`}>
                            {stat.value}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                            {stat.sub}
                        </div>
                    </div>
                </Panel>
            ))}
        </div>
    );
}
