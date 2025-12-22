export interface TranscriptMessage {
    role: "patient" | "ai";
    content: string;
    timestamp: string;
}

export interface RiskPhrase {
    phrase: string;
    severity: "critical" | "high" | "moderate";
    context: string;
    messageIndex: number;
}

export interface ClinicianNote {
    content: string;
    author: string;
    timestamp: string;
}

export interface StatusAuditEntry {
    timestamp: string;
    oldStatus: "New" | "In Review" | "Actioned";
    newStatus: "New" | "In Review" | "Actioned";
    changedBy: string;
}

export interface Patient {
    id: string;
    patient_pseudonym: string;
    name: string;
    initials: string;
    age: number;
    chief_complaint: string;
    key_reason: string;
    risk_score: number;
    risk_band: "Low" | "Moderate" | "High" | "Critical";
    status: "escalated" | "active" | "completed";
    triage_status: "New" | "In Review" | "Actioned";
    wait_time: string;
    triaged_at: string;
    actioned_at?: string;
    ai_summary: string;
    full_transcript: TranscriptMessage[];
    risk_phrases: RiskPhrase[];
    notes: ClinicianNote[];
    audit_trail: StatusAuditEntry[];
    phq9_score?: number;
    gad7_score?: number;
}

export const PATIENTS: Patient[] = [
    {
        id: "MB-9921",
        patient_pseudonym: "PT-2401",
        name: "Alex Thompson",
        initials: "AT",
        age: 28,
        chief_complaint: "Severe panic attacks, unable to leave house",
        key_reason: "Agoraphobia, panic attacks",
        risk_score: 85,
        risk_band: "Critical",
        status: "escalated",
        triage_status: "New",
        wait_time: "2m",
        triaged_at: "2025-12-02T20:28:00+11:00",
        ai_summary: "Patient reports acute agoraphobia and panic symptoms. PHQ-9 score > 20. Immediate intervention recommended.",
        phq9_score: 22,
        gad7_score: 19,
        full_transcript: [
            { role: "ai", content: "Hello, I'm here to help. Can you tell me what's bringing you here today?", timestamp: "2025-12-02T20:15:00+11:00" },
            { role: "patient", content: "I can't leave my house anymore. Every time I try, I feel like I'm going to die.", timestamp: "2025-12-02T20:15:30+11:00" },
            { role: "ai", content: "I'm sorry you're experiencing this. Can you tell me more about these feelings? When did they start?", timestamp: "2025-12-02T20:16:00+11:00" },
            { role: "patient", content: "About three weeks ago. It's getting worse. I can't go on like this. I feel completely hopeless.", timestamp: "2025-12-02T20:16:45+11:00" },
            { role: "ai", content: "I hear that you're struggling and feeling hopeless. That must be very difficult. Have you had any thoughts of harming yourself?", timestamp: "2025-12-02T20:17:15+11:00" },
            { role: "patient", content: "No, nothing like that. But I feel like a burden to everyone. My family has to do everything for me now.", timestamp: "2025-12-02T20:17:50+11:00" },
        ],
        risk_phrases: [
            { phrase: "can't go on", severity: "high", context: "I can't go on like this. I feel completely hopeless.", messageIndex: 3 },
            { phrase: "completely hopeless", severity: "moderate", context: "I can't go on like this. I feel completely hopeless.", messageIndex: 3 },
            { phrase: "burden to everyone", severity: "high", context: "But I feel like a burden to everyone.", messageIndex: 5 },
        ],
        notes: [],
        audit_trail: [
            { timestamp: "2025-12-02T20:28:00+11:00", oldStatus: "New", newStatus: "New", changedBy: "System (Auto-triage)" }
        ]
    },
    {
        id: "MB-9922",
        patient_pseudonym: "PT-2402",
        name: "Sarah Chen",
        initials: "SC",
        age: 34,
        chief_complaint: "Insomnia and work stress",
        key_reason: "Work stress, insomnia",
        risk_score: 45,
        risk_band: "Moderate",
        status: "active",
        triage_status: "In Review",
        wait_time: "15m",
        triaged_at: "2025-12-02T20:13:00+11:00",
        ai_summary: "Moderate anxiety related to job performance. Sleep hygiene poor. Recommended CBT-I module.",
        phq9_score: 12,
        gad7_score: 14,
        full_transcript: [
            { role: "ai", content: "Welcome. What would you like to talk about today?", timestamp: "2025-12-02T20:00:00+11:00" },
            { role: "patient", content: "I haven't been sleeping well. Work has been really stressful and I can't shut my brain off at night.", timestamp: "2025-12-02T20:00:25+11:00" },
            { role: "ai", content: "Sleep difficulties can be very draining. How long have you been experiencing this?", timestamp: "2025-12-02T20:01:00+11:00" },
            { role: "patient", content: "Maybe two months? I'm worried I'm going to lose my job if I can't focus. I feel overwhelmed all the time.", timestamp: "2025-12-02T20:01:40+11:00" },
            { role: "ai", content: "It sounds like the stress is really affecting you. Can you tell me about your typical bedtime routine?", timestamp: "2025-12-02T20:02:15+11:00" },
            { role: "patient", content: "I usually work until 11pm, then scroll on my phone for a bit, maybe get to bed around 1am.", timestamp: "2025-12-02T20:02:50+11:00" },
        ],
        risk_phrases: [
            { phrase: "overwhelmed", severity: "moderate", context: "I feel overwhelmed all the time.", messageIndex: 3 },
        ],
        notes: [
            { content: "Patient shows signs of work-related stress. Recommend CBT-I and sleep hygiene education. Monitor for escalation.", author: "Dr. Demo", timestamp: "2025-12-02T20:14:00+11:00" }
        ],
        audit_trail: [
            { timestamp: "2025-12-02T20:13:00+11:00", oldStatus: "New", newStatus: "New", changedBy: "System (Auto-triage)" },
            { timestamp: "2025-12-02T20:14:00+11:00", oldStatus: "New", newStatus: "In Review", changedBy: "Dr. Demo" }
        ]
    },
    {
        id: "MB-9923",
        patient_pseudonym: "PT-2403",
        name: "Michael Ross",
        initials: "MR",
        age: 45,
        chief_complaint: "Feeling 'down' for 2 weeks",
        key_reason: "Depression symptoms",
        risk_score: 62,
        risk_band: "High",
        status: "active",
        triage_status: "In Review",
        wait_time: "8m",
        triaged_at: "2025-12-02T20:20:00+11:00",
        ai_summary: "Symptoms consistent with mild-moderate depressive episode. No self-harm risk detected.",
        phq9_score: 15,
        gad7_score: 8,
        full_transcript: [
            { role: "ai", content: "Hi Michael, thank you for reaching out. What brings you here today?", timestamp: "2025-12-02T20:05:00+11:00" },
            { role: "patient", content: "I've just been feeling really down lately. Nothing seems enjoyable anymore.", timestamp: "2025-12-02T20:05:35+11:00" },
            { role: "ai", content: "I'm sorry to hear that. How long have you been feeling this way?", timestamp: "2025-12-02T20:06:00+11:00" },
            { role: "patient", content: "About two weeks, maybe a bit longer. I used to love playing guitar but I can't even pick it up now.", timestamp: "2025-12-02T20:06:40+11:00" },
            { role: "ai", content: "Loss of interest in activities you used to enjoy can be significant. Have you noticed any changes in your sleep or appetite?", timestamp: "2025-12-02T20:07:15+11:00" },
            { role: "patient", content: "Yeah, I'm sleeping a lot more. And I'm not really hungry most of the time.", timestamp: "2025-12-02T20:07:50+11:00" },
        ],
        risk_phrases: [],
        notes: [
            { content: "Classic depressive symptoms. PHQ-9 indicates moderate depression. Consider referral for therapy. No immediate safety concerns.", author: "Dr. Demo", timestamp: "2025-12-02T20:21:30+11:00" }
        ],
        audit_trail: [
            { timestamp: "2025-12-02T20:20:00+11:00", oldStatus: "New", newStatus: "New", changedBy: "System (Auto-triage)" },
            { timestamp: "2025-12-02T20:21:00+11:00", oldStatus: "New", newStatus: "In Review", changedBy: "Dr. Demo" }
        ]
    },
    {
        id: "MB-9924",
        patient_pseudonym: "PT-2404",
        name: "Emily Davis",
        initials: "ED",
        age: 22,
        chief_complaint: "Relationship breakup, feeling overwhelmed",
        key_reason: "Relationship breakup",
        risk_score: 25,
        risk_band: "Low",
        status: "completed",
        triage_status: "Actioned",
        wait_time: "45m",
        triaged_at: "2025-12-02T19:35:00+11:00",
        actioned_at: "2025-12-02T20:15:00+11:00",
        ai_summary: "Situational distress. Provided coping strategies and journaling prompt. Patient stable.",
        phq9_score: 8,
        gad7_score: 7,
        full_transcript: [
            { role: "ai", content: "Hello Emily, I'm here to support you. What would you like to talk about?", timestamp: "2025-12-02T19:25:00+11:00" },
            { role: "patient", content: "My boyfriend and I just broke up after 3 years. I feel so lost.", timestamp: "2025-12-02T19:25:30+11:00" },
            { role: "ai", content: "Breakups can be very painful. How are you coping with this change?", timestamp: "2025-12-02T19:26:00+11:00" },
            { role: "patient", content: "I'm crying a lot, but my friends have been really supportive. I just feel overwhelmed sometimes.", timestamp: "2025-12-02T19:26:45+11:00" },
            { role: "ai", content: "It's good that you have supportive friends. Feeling overwhelmed during a difficult transition is normal. Have you been able to maintain your daily routines?", timestamp: "2025-12-02T19:27:20+11:00" },
            { role: "patient", content: "Mostly, yeah. I still go to work and I'm eating okay. Just emotional at times.", timestamp: "2025-12-02T19:28:00+11:00" },
        ],
        risk_phrases: [
            { phrase: "overwhelmed", severity: "moderate", context: "I just feel overwhelmed sometimes.", messageIndex: 3 },
        ],
        notes: [
            { content: "Situational distress following relationship breakup. Good support system in place. Coping mechanisms functional. Provided psychoeducation and self-care strategies. Low risk, no follow-up needed unless patient reaches out.", author: "Dr. Demo", timestamp: "2025-12-02T20:10:00+11:00" }
        ],
        audit_trail: [
            { timestamp: "2025-12-02T19:35:00+11:00", oldStatus: "New", newStatus: "New", changedBy: "System (Auto-triage)" },
            { timestamp: "2025-12-02T19:50:00+11:00", oldStatus: "New", newStatus: "In Review", changedBy: "Dr. Demo" },
            { timestamp: "2025-12-02T20:15:00+11:00", oldStatus: "In Review", newStatus: "Actioned", changedBy: "Dr. Demo" }
        ]
    },
    {
        id: "MB-9925",
        patient_pseudonym: "PT-2405",
        name: "David Kim",
        initials: "DK",
        age: 51,
        chief_complaint: "Recurring intrusive thoughts",
        key_reason: "Intrusive thoughts, anxiety",
        risk_score: 78,
        risk_band: "Critical",
        status: "escalated",
        triage_status: "New",
        wait_time: "5m",
        triaged_at: "2025-12-02T20:23:00+11:00",
        ai_summary: "Potential OCD indicators with high distress. Flagged for psychiatric evaluation.",
        phq9_score: 16,
        gad7_score: 18,
        full_transcript: [
            { role: "ai", content: "Hello, I'm here to help. What's on your mind today?", timestamp: "2025-12-02T20:10:00+11:00" },
            { role: "patient", content: "I keep having these thoughts that I can't control. They're disturbing and I can't make them stop.", timestamp: "2025-12-02T20:10:40+11:00" },
            { role: "ai", content: "I understand that must be distressing. Can you tell me more about these thoughts?", timestamp: "2025-12-02T20:11:15+11:00" },
            { role: "patient", content: "They're about bad things happening to my family. I know they're not real but I can't cope with them. I have to check on my kids constantly.", timestamp: "2025-12-02T20:12:00+11:00" },
            { role: "ai", content: "It sounds like these thoughts are causing you significant anxiety. How long have you been experiencing this?", timestamp: "2025-12-02T20:12:40+11:00" },
            { role: "patient", content: "Months now. It's getting worse. I'm losing control and it's affecting everything.", timestamp: "2025-12-02T20:13:25+11:00" },
        ],
        risk_phrases: [
            { phrase: "can't cope", severity: "moderate", context: "I know they're not real but I can't cope with them.", messageIndex: 3 },
            { phrase: "losing control", severity: "moderate", context: "I'm losing control and it's affecting everything.", messageIndex: 5 },
        ],
        notes: [],
        audit_trail: [
            { timestamp: "2025-12-02T20:23:00+11:00", oldStatus: "New", newStatus: "New", changedBy: "System (Auto-triage)" }
        ]
    },
    {
        id: "MB-9926",
        patient_pseudonym: "PT-2406",
        name: "Jessica Martinez",
        initials: "JM",
        age: 29,
        chief_complaint: "Chronic anxiety, panic symptoms",
        key_reason: "Chronic anxiety",
        risk_score: 55,
        risk_band: "Moderate",
        status: "active",
        triage_status: "New",
        wait_time: "1h 20m",
        triaged_at: "2025-12-02T19:08:00+11:00",
        ai_summary: "Generalized anxiety with occasional panic episodes. History of anxiety disorder. Medication compliance unclear.",
        phq9_score: 10,
        gad7_score: 16,
        full_transcript: [
            { role: "ai", content: "Hi Jessica, welcome. How can I help you today?", timestamp: "2025-12-02T18:55:00+11:00" },
            { role: "patient", content: "I've been dealing with anxiety for years, but lately it's been really bad. I had a panic attack at work yesterday.", timestamp: "2025-12-02T18:55:45+11:00" },
            { role: "ai", content: "I'm sorry you had that experience. Can you tell me what triggered it?", timestamp: "2025-12-02T18:56:20+11:00" },
            { role: "patient", content: "I don't know, nothing specific. Just suddenly felt like I couldn't breathe and my heart was racing. I feel like I can't handle the stress anymore.", timestamp: "2025-12-02T18:57:10+11:00" },
            { role: "ai", content: "Are you currently taking any medication for your anxiety?", timestamp: "2025-12-02T18:57:50+11:00" },
            { role: "patient", content: "I was prescribed something a few months ago but I stopped taking it. I didn't like the side effects.", timestamp: "2025-12-02T18:58:30+11:00" },
        ],
        risk_phrases: [
            { phrase: "can't handle", severity: "moderate", context: "I feel like I can't handle the stress anymore.", messageIndex: 3 },
        ],
        notes: [],
        audit_trail: [
            { timestamp: "2025-12-02T19:08:00+11:00", oldStatus: "New", newStatus: "New", changedBy: "System (Auto-triage)" }
        ]
    }
];
