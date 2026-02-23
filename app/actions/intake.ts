"use server";

import { createClient } from "@supabase/supabase-js";
import {
    getOpenAiApiKey,
    getOpenAiMaxOutputTokens,
    getOpenAiModel,
} from "@/lib/openai-config";

// We use a direct client here with the ANON key, relying on RLS policies to allow insert.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type StructuredClinicianSummary = {
    summary: string;
    key_findings: string[];
    recommendations: string[];
    insights: string[];
    analysis: string;
    risk_score: number | null;
    phq9_score: number | null;
    gad7_score: number | null;
};

function sanitizeReportText(value: string): string {
    return value
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/\s+/g, ' ')
        .trim();
}

function toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => (typeof item === "string" ? sanitizeReportText(item) : ""))
        .filter(Boolean)
        .slice(0, 8);
}

function toNullableNumber(value: unknown): number | null {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}

function normalizeScore(value: number | null, min: number, max: number): number | null {
    if (value === null) return null;
    return Math.max(min, Math.min(max, Math.round(value)));
}

function parseStructuredSummary(rawText: string): StructuredClinicianSummary | null {
    try {
        const parsed = JSON.parse(rawText) as Record<string, unknown>;
        const summary = typeof parsed.summary === "string" ? sanitizeReportText(parsed.summary) : "";
        if (!summary) return null;

        const keyFindings = toStringArray(parsed.key_findings);
        const recommendations = toStringArray(parsed.recommendations);
        const insights = toStringArray(parsed.insights);
        const analysis = typeof parsed.analysis === "string" ? sanitizeReportText(parsed.analysis) : "";

        const riskScore = normalizeScore(toNullableNumber(parsed.risk_score), 0, 100);
        const phq9Score = normalizeScore(toNullableNumber(parsed.phq9_score), 0, 27);
        const gad7Score = normalizeScore(toNullableNumber(parsed.gad7_score), 0, 21);

        return {
            summary,
            key_findings: keyFindings,
            recommendations,
            insights,
            analysis,
            risk_score: riskScore,
            phq9_score: phq9Score,
            gad7_score: gad7Score,
        };
    } catch {
        return null;
    }
}

function extractPatientTranscriptLines(transcript: string): string[] {
    return transcript
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => /^Patient:/i.test(line))
        .map((line) => line.replace(/^Patient:\s*/i, ""))
        .filter(Boolean);
}

function buildHeuristicSummary(
    complaint: string,
    clinicalAnalysis: string,
    transcript: string,
    riskScore: number | null,
): StructuredClinicianSummary {
    const patientLines = extractPatientTranscriptLines(transcript);
    const latestPatientLines = patientLines.slice(-3);

    const findingsFromTranscript = latestPatientLines
        .flatMap((line) => line.split(/[.!?]/))
        .map((line) => sanitizeReportText(line))
        .filter(Boolean)
        .slice(0, 5);

    const analysisText = sanitizeReportText(clinicalAnalysis || "Conversation reviewed and prepared for clinician handoff.");

    return {
        summary: sanitizeReportText(complaint || latestPatientLines[0] || "Intake completed and ready for clinician review."),
        key_findings:
            findingsFromTranscript.length > 0
                ? findingsFromTranscript
                : ["Patient completed conversational intake and requested clinician review."],
        recommendations: [
            "Review full transcript and confirm timeline of symptom progression.",
            "Clarify functional impact and immediate priorities with the patient.",
            "Agree on an initial management and follow-up plan.",
        ],
        insights: [
            "Patient provided a coherent symptom narrative and engaged with follow-up questions.",
            "Current handoff is based on conversational intake and should be clinically validated during review.",
        ],
        analysis: analysisText,
        risk_score: normalizeScore(riskScore, 0, 100),
        phq9_score: null,
        gad7_score: null,
    };
}

function extractResponseOutputText(response: unknown): string {
    const typedResponse = response as {
        output_text?: string;
        output?: Array<{
            type?: string;
            content?: Array<{ type?: string; text?: string }>;
        }>;
    };

    if (typeof typedResponse.output_text === "string" && typedResponse.output_text.trim().length > 0) {
        return typedResponse.output_text.trim();
    }

    const output = Array.isArray(typedResponse.output) ? typedResponse.output : [];
    const chunks: string[] = [];

    for (const item of output) {
        if (!item || item.type !== "message" || !Array.isArray(item.content)) continue;
        for (const part of item.content) {
            if (part?.type === "output_text" && typeof part.text === "string" && part.text.trim().length > 0) {
                chunks.push(part.text.trim());
            }
        }
    }

    return chunks.join("\n").trim();
}

async function generateStructuredSummaryWithOpenAi(
    complaint: string,
    clinicalAnalysis: string,
    transcript: string,
    riskScore: number | null,
): Promise<StructuredClinicianSummary | null> {
    const openAiApiKey = getOpenAiApiKey();
    if (!openAiApiKey) return null;

    try {
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI({ apiKey: openAiApiKey });
        const model = getOpenAiModel("gpt-5-nano");
        const maxOutputTokens = Math.max(getOpenAiMaxOutputTokens(900), 900);

        const prompt = `You are preparing a clinician handoff summary from an intake conversation.
Return valid JSON only with keys:
- summary (string, 2-4 sentences)
- key_findings (string[], 3-6 concise bullets)
- recommendations (string[], 3-5 practical next-step bullets for clinician)
- insights (string[], 2-4 context insights)
- analysis (string, concise clinical reasoning)
- risk_score (number 0-100)
- phq9_score (number 0-27 or null)
- gad7_score (number 0-21 or null)

Style constraints:
- Do not use em dashes in any field.
- Keep language clear, specific, and clinically useful.

Context:
Complaint: ${complaint}
Existing analysis: ${clinicalAnalysis}
Reported risk score: ${riskScore ?? "null"}
Conversation transcript:
${transcript}`;

        let rawText = "";
        if (model.startsWith("gpt-5")) {
            const response = await openai.responses.create({
                model,
                reasoning: { effort: "minimal" },
                input: [
                    { role: "system", content: "Produce concise clinician handoff JSON only." },
                    { role: "user", content: prompt },
                ],
                max_output_tokens: maxOutputTokens,
            });
            rawText = extractResponseOutputText(response);
        } else {
            const completion = await openai.chat.completions.create({
                model,
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: "Produce concise clinician handoff JSON only." },
                    { role: "user", content: prompt },
                ],
                max_tokens: maxOutputTokens,
            });
            rawText = completion.choices?.[0]?.message?.content?.trim() ?? "";
        }

        if (!rawText) return null;
        return parseStructuredSummary(rawText);
    } catch (error) {
        console.error("OpenAI structured handoff generation failed:", error);
        return null;
    }
}

function extractAnalysisSection(source: string, heading: string): string {
    const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`${escapedHeading}:\\n([\\s\\S]*?)(?:\\n\\n[A-Za-z ]+:\\n|$)`, "i");
    const match = source.match(pattern);
    return sanitizeReportText(match?.[1]?.trim() ?? "");
}

async function buildSummaryJson(
    complaint: string,
    aiAnalysis: string,
    riskScore: number | null | undefined,
    phq9Score: number | null | undefined,
    gad7Score: number | null | undefined,
) {
    const assistantSummary = extractAnalysisSection(aiAnalysis, "Assistant summary");
    const clinicalAnalysis = extractAnalysisSection(aiAnalysis, "Clinical analysis");
    const transcript = extractAnalysisSection(aiAnalysis, "Conversation transcript");

    const structuredSummaryFromModel = await generateStructuredSummaryWithOpenAi(
        complaint,
        clinicalAnalysis,
        transcript,
        typeof riskScore === "number" ? riskScore : null,
    );

    if (structuredSummaryFromModel) {
        return {
            ...structuredSummaryFromModel,
            phq9_score: typeof phq9Score === "number" ? phq9Score : structuredSummaryFromModel.phq9_score,
            gad7_score: typeof gad7Score === "number" ? gad7Score : structuredSummaryFromModel.gad7_score,
            risk_score:
                typeof riskScore === "number"
                    ? riskScore
                    : structuredSummaryFromModel.risk_score,
        };
    }

    const heuristicSummary = buildHeuristicSummary(
        assistantSummary || complaint,
        clinicalAnalysis,
        transcript,
        typeof riskScore === "number" ? riskScore : null,
    );

    return {
        ...heuristicSummary,
        phq9_score: typeof phq9Score === "number" ? phq9Score : heuristicSummary.phq9_score,
        gad7_score: typeof gad7Score === "number" ? gad7Score : heuristicSummary.gad7_score,
    };
}

function riskToUrgencyTier(riskScore: number | null): "Critical" | "High" | "Moderate" {
    if (typeof riskScore !== "number") return "Moderate";
    if (riskScore > 70) return "Critical";
    if (riskScore > 30) return "High";
    return "Moderate";
}

export async function submitIntake(
    clinicId: string,
    data: {
        complaint: string;
        aiAnalysis?: string;
        riskScore?: number | null;
        phq9Score?: number | null;
        gad7Score?: number | null;
        screeningRefused?: boolean;
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
        const structuredSummary = await buildSummaryJson(
            data.complaint,
            data.aiAnalysis,
            data.riskScore,
            data.phq9Score,
            data.gad7Score,
        );
        const resolvedRiskScore =
            typeof data.riskScore === "number"
                ? data.riskScore
                : structuredSummary.risk_score;
        const resolvedPhq9Score =
            typeof data.phq9Score === "number"
                ? data.phq9Score
                : structuredSummary.phq9_score;
        const resolvedGad7Score =
            typeof data.gad7Score === "number"
                ? data.gad7Score
                : structuredSummary.gad7_score;

        const { error: triageInsertError } = await supabase.from('triage_outputs').insert({
            clinic_id: clinicId,
            intake_id: intakeId,
            urgency_tier: riskToUrgencyTier(resolvedRiskScore),
            risk_score: resolvedRiskScore,
            phq9_score: resolvedPhq9Score,
            gad7_score: resolvedGad7Score,
            summary_json: {
                summary: structuredSummary.summary,
                key_findings: structuredSummary.key_findings,
                analysis: structuredSummary.analysis,
                risk_score: structuredSummary.risk_score,
                recommendations: structuredSummary.recommendations,
                insights: structuredSummary.insights,
                screening_refused: Boolean(data.screeningRefused),
            },
            risk_flags_json: resolvedRiskScore && resolvedRiskScore > 70 ? ["Elevated Risk Detected"] : []
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
