"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search, Filter, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Mock patient data
const MOCK_PATIENTS = [
    { id: "1", name: "Sarah Johnson", status: "high", riskScore: 72, lastActive: "2 hours ago", age: 28, reason: "Depression, Sleep issues" },
    { id: "2", name: "Michael Chen", status: "moderate", riskScore: 45, lastActive: "1 day ago", age: 34, reason: "Anxiety, Work stress" },
    { id: "3", name: "Emma Wilson", status: "low", riskScore: 18, lastActive: "3 days ago", age: 42, reason: "General wellness check" },
    { id: "4", name: "David Martinez", status: "high", riskScore: 68, lastActive: "30 mins ago", age: 25, reason: "Panic attacks" },
    { id: "5", name: "Lisa Anderson", status: "moderate", riskScore: 52, lastActive: "5 hours ago", age: 31, reason: "Insomnia, Stress" },
    { id: "6", name: "James Taylor", status: "low", riskScore: 22, lastActive: "1 week ago", age: 38, reason: "Follow-up" },
];

const getRiskBadge = (status: string) => {
    switch (status) {
        case "high":
            return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">High Risk</Badge>;
        case "moderate":
            return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Moderate</Badge>;
        case "low":
            return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Low Risk</Badge>;
        default:
            return null;
    }
};

const getRiskIcon = (status: string) => {
    switch (status) {
        case "high":
            return <AlertTriangle className="h-4 w-4 text-rose-500" />;
        case "moderate":
            return <Clock className="h-4 w-4 text-amber-500" />;
        case "low":
            return <CheckCircle className="h-4 w-4 text-emerald-500" />;
        default:
            return null;
    }
};

export default function PatientsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const filteredPatients = MOCK_PATIENTS.filter((patient) => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || patient.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <DashboardShell>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Patient Management</h2>
                    <p className="text-muted-foreground">
                        View and manage all patients in your queue.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search patients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={filterStatus === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterStatus("all")}
                        >
                            All
                        </Button>
                        <Button
                            variant={filterStatus === "high" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterStatus("high")}
                        >
                            High Risk
                        </Button>
                        <Button
                            variant={filterStatus === "moderate" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterStatus("moderate")}
                        >
                            Moderate
                        </Button>
                        <Button
                            variant={filterStatus === "low" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterStatus("low")}
                        >
                            Low Risk
                        </Button>
                    </div>
                </div>

                {/* Patient List */}
                <Panel className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-white/10">
                                <tr className="text-left text-sm font-medium text-muted-foreground">
                                    <th className="px-6 py-4">Patient</th>
                                    <th className="px-6 py-4">Risk Level</th>
                                    <th className="px-6 py-4">Score</th>
                                    <th className="px-6 py-4">Reason</th>
                                    <th className="px-6 py-4">Last Active</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map((patient) => (
                                    <tr
                                        key={patient.id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {getRiskIcon(patient.status)}
                                                <div>
                                                    <div className="font-medium">{patient.name}</div>
                                                    <div className="text-sm text-muted-foreground">Age {patient.age}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getRiskBadge(patient.status)}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm">{patient.riskScore}/100</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-muted-foreground">{patient.reason}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-muted-foreground">{patient.lastActive}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link href={`/dashboard/patients/${patient.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    View Details
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Panel>
            </div>
        </DashboardShell>
    );
}
