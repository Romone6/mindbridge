"use client";

import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Search, AlertTriangle, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useClinic } from "@/components/providers/clinic-provider";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { Intake } from "@/types/patient";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const getRiskBadge = (tier: string) => {
    switch (tier) {
        case "Critical":
        case "High":
            return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">{tier} Risk</Badge>;
        case "Moderate":
            return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">{tier}</Badge>;
        case "Low":
            return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{tier}</Badge>;
        default:
            return <Badge variant="outline">Pending</Badge>;
    }
};

const getRiskIcon = (tier: string) => {
    switch (tier) {
        case "Critical":
        case "High":
            return <AlertTriangle className="h-4 w-4 text-rose-500" />;
        case "Moderate":
            return <Clock className="h-4 w-4 text-amber-500" />;
        case "Low":
            return <CheckCircle className="h-4 w-4 text-emerald-500" />;
        default:
            return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
};

export default function PatientsPage() {
    const { currentClinic } = useClinic();
    const { getToken } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [intakes, setIntakes] = useState<Intake[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!currentClinic) return;

        const fetchIntakes = async () => {
            setIsLoading(true);
            try {
                const token = await getToken({ template: 'supabase' });
                const supabase = createClerkSupabaseClient(token!);
                if (!supabase) return;

                const { data, error } = await supabase
                    .from('intakes')
                    .select(`
                        *,
                        patient:patients(*),
                        triage:triage_outputs(*)
                    `)
                    .eq('clinic_id', currentClinic.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setIntakes(data as unknown as Intake[]);
            } catch (error) {
                console.error("Failed to fetch intakes:", error);
                toast.error("Failed to load patient queue");
            } finally {
                setIsLoading(false);
            }
        };

        fetchIntakes();
    }, [currentClinic, getToken]);

    const filteredIntakes = intakes.filter((intake) => {
        const patientName = intake.patient?.patient_ref || "Unknown";
        const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter logic: Map specific filters to risk tiers
        const triage = intake.triage?.[0];
        const tier = triage?.urgency_tier || "Pending";
        
        let matchesFilter = true;
        if (filterStatus !== "all") {
             if (filterStatus === "high") matchesFilter = tier === "High" || tier === "Critical";
             else if (filterStatus === "moderate") matchesFilter = tier === "Moderate";
             else if (filterStatus === "low") matchesFilter = tier === "Low";
        }
        
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Patient queue</h2>
                <p className="text-muted-foreground">
                    Triage queue for {currentClinic?.name || "your clinic"}.
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
            <Panel className="overflow-hidden min-h-[300px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredIntakes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <p>No patients found.</p>
                        <p className="text-sm">New intakes will appear here automatically.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Risk level</TableHead>
                                <TableHead>Summary</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredIntakes.map((intake) => {
                                const triage = intake.triage?.[0];
                                const tier = triage?.urgency_tier || "Pending";
                                const summary = triage?.summary_json?.summary || "No summary available";

                                return (
                                    <TableRow key={intake.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {getRiskIcon(tier)}
                                                <div>
                                                    <div className="font-medium">{intake.patient?.patient_ref || "Guest"}</div>
                                                    <div className="text-sm text-muted-foreground">ID: {intake.patient?.id.slice(0, 8)}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getRiskBadge(tier)}</TableCell>
                                        <TableCell className="max-w-md">
                                            <span className="text-sm text-muted-foreground line-clamp-2">{summary}</span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(intake.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/dashboard/patients/${intake.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    Review case
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </Panel>
        </div>
    );
}
