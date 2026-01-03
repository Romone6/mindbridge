"use client";

import { TranscriptMessage } from "@/lib/mock-data";

import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TranscriptViewer } from "@/components/dashboard/transcript-viewer";
import { RiskBreakdown } from "@/components/dashboard/risk-breakdown";
import { ClinicianNotesPanel } from "@/components/dashboard/clinician-notes-panel";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { Intake } from "@/types/patient";

export default function PatientDetailPage() {
    const params = useParams();
    const intakeId = params.id as string; // We link to intake ID now
    const { getToken } = useAuth();
    const [intake, setIntake] = useState<Intake | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchIntake = async () => {
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
                    .eq('id', intakeId)
                    .single();

                if (error) throw error;
                setIntake(data as unknown as Intake);
            } catch (err) {
                console.error("Failed to load intake:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (intakeId) fetchIntake();
    }, [intakeId, getToken]);

    if (isLoading) {
         return (
            <div className="flex flex-col items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Loading case details...</p>
            </div>
         );
    }

    if (!intake) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px]">
                <p className="text-muted-foreground">Case not found</p>
                <Link href="/dashboard/patients">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Queue
                    </Button>
                </Link>
            </div>
        );
    }

    const triage = intake.triage?.[0];
    const tier = triage?.urgency_tier || "Pending";
    const summary = (triage?.summary_json as any) || {};
    const riskFlags = triage?.risk_flags_json || [];

    // Mock transcript data mapping if we don't have real chat history yet
    // In Phase 4, we stored 'complaint' in answers_json.
    // We can simulate a transcript from that.
    const transcript: TranscriptMessage[] = [
        { role: 'ai', content: 'What brings you in today?', timestamp: new Date(intake.created_at).toISOString() },
        { role: 'patient', content: intake.answers_json?.complaint || "No complaint recorded.", timestamp: new Date(intake.created_at).toISOString() }
    ];

    const getRiskBadge = (band: string) => {
        switch (band) {
            case "Critical":
                return <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-lg px-4 py-1">Critical Risk</Badge>;
            case "High":
                return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 text-lg px-4 py-1">High Risk</Badge>;
            case "Moderate":
                return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-lg px-4 py-1">Moderate Risk</Badge>;
            case "Low":
                return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-lg px-4 py-1">Low Risk</Badge>;
            default:
                return <Badge variant="outline">Pending Assessment</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/dashboard/patients">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Queue
                    </Button>
                </Link>
                <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-3xl font-bold tracking-tight">{intake.patient?.patient_ref || "Guest Patient"}</h2>
                    {getRiskBadge(tier)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>ID: {intake.patient?.id}</span>
                    <span>•</span>
                    <span>Submitted: {new Date(intake.created_at).toLocaleString()}</span>
                </div>
            </div>

            {/* Risk Alert */}
            {(tier === "Critical" || tier === "High") && (
                <Panel className="bg-destructive/5 border-destructive/20">
                    <div className="flex items-start gap-3 p-4">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-500">{tier} Risk Alert</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                This patient requires immediate clinical attention. Review key findings below.
                            </p>
                        </div>
                    </div>
                </Panel>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Transcript and Details (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Summary */}
                    <Panel className="p-6">
                        <h3 className="text-lg font-semibold mb-2">AI Summary</h3>
                        <p className="text-muted-foreground">{summary.summary || "No summary generated."}</p>
                        
                        {summary.key_findings && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <h4 className="text-sm font-medium mb-2">Key Findings</h4>
                                <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                                    {summary.key_findings.map((f: string, i: number) => (
                                        <li key={i}>{f}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Panel>

                    {/* Transcript */}
                    <Panel className="overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-lg font-semibold">Intake Transcript</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Patient submission and automated responses.
                            </p>
                        </div>
                        {/* We reuse TranscriptViewer but pass simple mock messages for now */}
                        <TranscriptViewer messages={transcript} riskPhrases={[]} />
                    </Panel>
                </div>

                {/* Right Column - Risk & Notes (1/3 width) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Risk Breakdown */}
                    <RiskBreakdown
                        riskScore={tier === "Critical" ? 90 : tier === "High" ? 70 : 30}
                        riskBand={tier as any}
                        phq9Score={0} // Not yet implemented
                        gad7Score={0} // Not yet implemented
                        riskPhraseCount={riskFlags.length}
                    />

                    {/* Clinician Notes & Status */}
                    {/* Note: We need to hook this up to real notes table later */}
                    <ClinicianNotesPanel
                        sessionId={intake.id}
                        initialNotes={[]}
                        initialStatus={intake.status === 'reviewed' || intake.status === 'archived' ? 'Actioned' : intake.status === 'triaged' ? 'In Review' : 'New'}
                        auditTrail={[]}
                    />
                </div>
            </div>
        </div>
    );
}
