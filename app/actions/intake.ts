"use server";

import { createClient } from "@supabase/supabase-js";

// We use a direct client here with the ANON key, relying on RLS policies to allow insert.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function extractAnalysisSection(source: string, heading: string): string {
    const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`${escapedHeading}:\\n([\\s\\S]*?)(?:\\n\\n[A-Za-z ]+:\\n|$)`, "i");
    const match = source.match(pattern);
    return match?.[1]?.trim() ?? "";
}

function buildSummaryJson(complaint: string, aiAnalysis: string, riskScore: number | null | undefined) {
    const assistantSummary = extractAnalysisSection(aiAnalysis, "Assistant summary");
    const clinicalAnalysis = extractAnalysisSection(aiAnalysis, "Clinical analysis");

    const summaryText = assistantSummary || complaint || "AI-generated intake assessment";
    const findingSource = clinicalAnalysis || aiAnalysis;
    const findings = findingSource
        .split(/\r?\n|[.!?]/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => !/^conversation transcript:/i.test(line))
        .slice(0, 4);

    return {
        summary: summaryText,
        key_findings: findings.length > 0 ? findings : ["Intake conversation captured and ready for clinician review."],
        analysis: clinicalAnalysis || aiAnalysis,
        risk_score: typeof riskScore === "number" ? riskScore : null,
    };
}

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
        const { error: triageInsertError } = await supabase.from('triage_outputs').insert({
            clinic_id: clinicId,
            intake_id: intakeId,
            urgency_tier: data.riskScore && data.riskScore > 70 ? 'Critical' : data.riskScore && data.riskScore > 30 ? 'High' : 'Moderate',
            risk_score: typeof data.riskScore === "number" ? data.riskScore : null,
            summary_json: buildSummaryJson(data.complaint, data.aiAnalysis, data.riskScore),
            risk_flags_json: data.riskScore && data.riskScore > 70 ? ["Elevated Risk Detected"] : []
        });

        if (triageInsertError) {
            throw new Error("Failed to persist AI triage output: " + triageInsertError.message);
        }
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
