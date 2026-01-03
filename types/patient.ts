export type IntakeStatus = 'pending' | 'triaged' | 'reviewed' | 'archived';

export type Patient = {
    id: string;
    clinic_id: string;
    patient_ref: string;
    created_at: string;
};

export type TriageSummary = {
    summary: string;
    key_findings: string[];
};

export type IntakeAnswers = {
    complaint: string;
    [key: string]: unknown; // Allow for extensibility
};

export type TranscriptMessage = {
    role: 'patient' | 'ai';
    content: string;
    timestamp: string;
};

export type RiskPhrase = {
    phrase: string;
    severity: 'critical' | 'high' | 'moderate';
    context: string;
    messageIndex: number;
};

export type ClinicianNote = {
    content: string;
    author: string;
    timestamp: string;
};

export type StatusAuditEntry = {
    timestamp: string;
    oldStatus: 'New' | 'In Review' | 'Actioned';
    newStatus: 'New' | 'In Review' | 'Actioned';
    changedBy: string;
};

export type TriageOutput = {
    id: string;
    clinic_id: string;
    intake_id: string;
    summary_json: TriageSummary;
    risk_flags_json: string[];
    urgency_tier: 'Critical' | 'High' | 'Moderate' | 'Low';
    risk_score?: number;
    phq9_score?: number;
    gad7_score?: number;
    created_at: string;
};

export type Intake = {
    id: string;
    clinic_id: string;
    patient_id: string;
    status: IntakeStatus;
    answers_json: IntakeAnswers;
    created_at: string;
    // Joined fields
    patient?: Patient;
    triage?: TriageOutput[]; // One-to-many in DB but usually 1-1 logically
};
