"use server";

import { createClient } from "@supabase/supabase-js";

// We use a direct client here with the ANON key, relying on RLS policies to allow insert.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function submitIntake(
    clinicId: string,
    data: {
        complaint: string;
        aiAnalysis?: string;
        riskScore?: number | null;
        patientName?: string;
        patientEmail?: string;
        patientPhone?: string;
        manualTakeoverRequested?: boolean;
    }
) {
    const patientName = data.patientName?.trim() || "Guest";
    const refPrefix = patientName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "G";

    // 1. Create a "Guest" Patient
    const patientId = crypto.randomUUID();
    const { error: patientError } = await supabase
        .from('patients')
        .insert({
            id: patientId,
            clinic_id: clinicId,
            patient_ref: `${refPrefix}-${Date.now().toString().slice(-4)}`
        });

    if (patientError) throw new Error("Failed to create patient record: " + patientError.message);

    // 2. Create Intake
    const intakeId = crypto.randomUUID();
    const { error: intakeError } = await supabase
        .from('intakes')
        .insert({
            id: intakeId,
            clinic_id: clinicId,
            patient_id: patientId,
            status: 'pending',
            answers_json: {
                ...data,
                patientName: data.patientName,
                patientEmail: data.patientEmail,
                patientPhone: data.patientPhone,
                manualTakeoverRequested: Boolean(data.manualTakeoverRequested),
                manualTakeoverActive: false,
            }
        });

    if (intakeError) throw new Error("Failed to submit intake: " + intakeError.message);

    // 3. Trigger Triage (Using AI results if provided, otherwise fallback to mock)
    if (data.aiAnalysis) {
        await supabase.from('triage_outputs').insert({
            clinic_id: clinicId,
            intake_id: intakeId,
            urgency_tier: data.riskScore && data.riskScore > 70 ? 'Critical' : data.riskScore && data.riskScore > 30 ? 'High' : 'Moderate',
            summary_json: {
                summary: "AI-Generated Intake Assessment",
                analysis: data.aiAnalysis,
                risk_score: data.riskScore
            },
            risk_flags_json: data.riskScore && data.riskScore > 70 ? ["Elevated Risk Detected"] : []
        });
    } else {
        await generateTriage(clinicId, intakeId, data.complaint);
    }

    return { id: intakeId };
}

async function generateTriage(clinicId: string, intakeId: string, complaint: string) {
    // Mock Triage Generation
    const text = complaint.toLowerCase();
    const riskLevel = text.includes("suicide") || text.includes("kill") || text.includes("die")
        ? "Critical"
        : text.includes("depressed") || text.includes("anxious")
            ? "High"
            : "Moderate";

    const summary = {
        summary: "Patient reports: " + complaint,
        key_findings: ["Self-reported distress", "Urgent keywords detected: " + (riskLevel === "Critical" ? "Yes" : "No")]
    };

    await supabase.from('triage_outputs').insert({
        clinic_id: clinicId,
        intake_id: intakeId,
        urgency_tier: riskLevel,
        summary_json: summary,
        risk_flags_json: riskLevel === "Critical" ? ["Immediate Harm Risk"] : []
    });
}
