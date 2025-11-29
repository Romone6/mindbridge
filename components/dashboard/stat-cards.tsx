import { GlassCard } from "@/components/ui/glass-card";
import { Activity, Users, Clock, AlertTriangle } from "lucide-react";

const stats = [
    {
        label: "Active Queue",
        value: "12",
        change: "+2 since last hour",
        icon: Users,
        color: "text-blue-400",
    },
    {
        label: "High Risk",
        value: "3",
        change: "Requires attention",
        icon: AlertTriangle,
        color: "text-rose-400",
    },
    {
        label: "Avg Triage Time",
        value: "4m 12s",
        change: "-30s vs yesterday",
        icon: Clock,
        color: "text-emerald-400",
    },
    {
        label: "AI Accuracy",
        value: "98.5%",
        change: "Based on feedback",
        icon: Activity,
        color: "text-purple-400",
    },
];

export function StatCards() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => (
                <GlassCard key={stat.label} className="p-6 flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                        <stat.icon className="h-5 w-5" />
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
