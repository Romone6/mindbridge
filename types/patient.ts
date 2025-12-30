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

export type TriageOutput = {
    id: string;
    clinic_id: string;
    intake_id: string;
    summary_json: TriageSummary;
    risk_flags_json: string[];
    urgency_tier: 'Critical' | 'High' | 'Moderate' | 'Low';
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
