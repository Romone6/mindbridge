export type ClinicianHandoffSummaryV1 = {
  schema_version: 1;
  summary: string;
  key_findings: string[];
  recommendations: string[];
  insights: string[];
  analysis: string;
  risk_score: number | null;
};

export type LegacyTriageSummary = {
  summary?: unknown;
  key_findings?: unknown;
  recommendations?: unknown;
  insights?: unknown;
  analysis?: unknown;
  risk_score?: unknown;
};

export type AnyTriageSummary = ClinicianHandoffSummaryV1 | LegacyTriageSummary | null | undefined;

function normalizeString(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function normalizeRiskScore(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

export function normalizeClinicianHandoffSummary(input: AnyTriageSummary): ClinicianHandoffSummaryV1 {
  const summary = normalizeString(input?.summary, "No data yet.");
  const keyFindings = normalizeStringArray(input?.key_findings);
  const recommendations = normalizeStringArray(input?.recommendations);
  const insights = normalizeStringArray(input?.insights);
  const analysis = normalizeString(input?.analysis, "No analysis provided.");
  const riskScore = normalizeRiskScore(input?.risk_score);

  return {
    schema_version: 1,
    summary,
    key_findings: keyFindings,
    recommendations,
    insights,
    analysis,
    risk_score: riskScore,
  };
}

export function createClinicianHandoffSummary(params: {
  summary: string;
  keyFindings?: string[];
  recommendations?: string[];
  insights?: string[];
  analysis?: string;
  riskScore?: number | null;
}): ClinicianHandoffSummaryV1 {
  return normalizeClinicianHandoffSummary({
    summary: params.summary,
    key_findings: params.keyFindings ?? [],
    recommendations: params.recommendations ?? [],
    insights: params.insights ?? [],
    analysis: params.analysis ?? "No analysis provided.",
    risk_score: params.riskScore ?? null,
  });
}
