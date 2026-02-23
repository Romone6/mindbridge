import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type OpenAI from 'openai';
import { cookies } from "next/headers";
import { getServerUserId } from "@/lib/auth/server";
import {
    getOpenAiApiKey,
    getOpenAiFallbackModel,
    getOpenAiMaxOutputTokens,
    getOpenAiModel,
} from "@/lib/openai-config";
import {
    createDemoUsageToken,
    getDemoUsageCookieName,
    readDemoUsage,
} from "@/lib/security/demo-usage";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type TriageMessage = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

type AssistantResponse = {
    role: 'assistant';
    content: string;
    risk_score?: number | null;
    analysis?: string | null;
};

type TriageFocusDomain = 'onset' | 'trend' | 'triggers' | 'impact' | 'medication' | 'safety' | 'phq9' | 'gad7' | 'summary' | 'complete';

type FallbackQuestionId = 'onset' | 'trend' | 'triggers' | 'impact' | 'medication' | 'safety' | 'summary';

function normalizeForComparison(value: string): string {
    return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function hasAnyTerm(text: string, terms: string[]): boolean {
    return terms.some((term) => text.includes(term));
}

function detectAcuteSafetyConcern(message: string | undefined): boolean {
    if (!message) return false;
    const normalized = message.toLowerCase();
    const concernTerms = ['suicid', 'self harm', 'harm myself', 'kill myself', 'immediate danger', 'can\'t stay safe'];
    const reassuranceTerms = [
        'i am safe',
        "i'm safe",
        'safe at the moment',
        'not in danger',
        'no plans to hurt',
        'safe right now',
        'im safe',
    ];

    const hasConcern = hasAnyTerm(normalized, concernTerms);
    const hasReassurance = hasAnyTerm(normalized, reassuranceTerms);
    return hasConcern && !hasReassurance;
}

function isSafetyEscalationMessage(content: string): boolean {
    const normalized = content.toLowerCase();
    return hasAnyTerm(normalized, [
        'your safety matters most',
        'feel at immediate risk',
        'tell me whether you are safe',
    ]);
}

function detectLastAssistantQuestionId(lastAssistantMessage: string): FallbackQuestionId | null {
    const lastAssistant = lastAssistantMessage.toLowerCase();

    if (hasAnyTerm(lastAssistant, ['when this started', 'when did this start', 'how long this has'])) return 'onset';
    if (hasAnyTerm(lastAssistant, ['getting better or worse', 'better, worse, or staying', 'same over time'])) return 'trend';
    if (hasAnyTerm(lastAssistant, ['makes it better', 'makes it worse', 'makes this better or harder', 'stress, sleep, or specific situations', 'triggers'])) return 'triggers';
    if (hasAnyTerm(lastAssistant, ['day-to-day', 'daily activities', 'sleep, school, work'])) return 'impact';
    if (hasAnyTerm(lastAssistant, ['dose', 'medication', 'side effects'])) return 'medication';
    if (hasAnyTerm(lastAssistant, ['thoughts of harming yourself', 'immediate danger', 'immediate risk', 'safe in this moment', 'safety concern'])) return 'safety';
    if (hasAnyTerm(lastAssistant, ['anything else', 'before i summarize'])) return 'summary';

    return null;
}

function detectAnsweredQuestionIds(messages: TriageMessage[]): Set<FallbackQuestionId> {
    const answeredQuestionIds = new Set<FallbackQuestionId>();

    for (let index = 0; index < messages.length; index += 1) {
        const currentMessage = messages[index];
        if (currentMessage.role !== 'assistant') {
            continue;
        }

        const askedQuestionId = detectLastAssistantQuestionId(currentMessage.content);
        if (!askedQuestionId) {
            continue;
        }

        for (let scan = index + 1; scan < messages.length; scan += 1) {
            const nextMessage = messages[scan];
            if (nextMessage.role === 'assistant') {
                break;
            }

            if (nextMessage.role === 'user' && nextMessage.content.trim().length > 0) {
                answeredQuestionIds.add(askedQuestionId);
                break;
            }
        }
    }

    return answeredQuestionIds;
}

function buildFallbackTriageResponse(messages: TriageMessage[]): AssistantResponse & { is_complete: boolean } {
    const userMessages = messages
        .filter((message) => message.role === 'user')
        .map((message) => message.content.trim())
        .filter(Boolean);
    const assistantMessages = messages
        .filter((message) => message.role === 'assistant')
        .map((message) => message.content.trim())
        .filter(Boolean);

    const lastUserMessage = [...messages]
        .reverse()
        .find((message) => message.role === 'user')
        ?.content;

    if (!lastUserMessage) {
        return {
            role: 'assistant',
            content: 'I am here to help with your intake. Could you tell me what brought you in today and how long you have been feeling this way?',
            risk_score: null,
            analysis: 'Fallback triage opening prompt used because live model output was unavailable.',
            is_complete: false,
        };
    }

    const lowerUserText = userMessages.join(' ').toLowerCase();
    const lowerAssistantText = assistantMessages.join(' ').toLowerCase();
    const lastAssistantMessage = assistantMessages.at(-1) ?? '';
    const lastAskedQuestionId = detectLastAssistantQuestionId(lastAssistantMessage);
    const answeredQuestionIds = detectAnsweredQuestionIds(messages);
    const hasCurrentSafetyConcern = detectAcuteSafetyConcern(lastUserMessage);
    const hasHistoricalSafetyConcern = hasAnyTerm(lowerUserText, ['suicid', 'self harm', 'harm myself', 'kill myself', 'immediate danger', 'can\'t stay safe']);

    const hasOnset = hasAnyTerm(lowerUserText, [' started ', ' started', ' since ', ' ago', ' for ', 'week', 'month', 'year', 'day']);
    const hasTrend = hasAnyTerm(lowerUserText, ['better', 'worse', 'improv', 'same', 'fluctuat', 'comes and goes']);
    const hasTriggers = hasAnyTerm(lowerUserText, [
        'trigger',
        'makes it worse',
        'makes it better',
        'helps when',
        'harder when',
        'easily overstimulated',
        'all the time',
        'constant',
        'no trigger',
        'none',
        'not really',
    ]);
    const hasImpact = hasAnyTerm(lowerUserText, ['sleep', 'school', 'work', 'daily', 'concentration', 'relationships', 'libido', 'energy', 'appetite']);
    const hasMedicationDetails = hasAnyTerm(lowerUserText, ['sertraline', 'medication', 'dose', 'mg', 'side effect', 'prescribed', 'started taking']);
    const safetyAlreadyAsked = hasAnyTerm(lowerAssistantText, ['thoughts of harming yourself', 'immediate danger', 'safety concern']);

    const questionQueue: { id: FallbackQuestionId; question: string; analysis: string }[] = [];

    if (!hasOnset && !answeredQuestionIds.has('onset')) {
        questionQueue.push({
            id: 'onset',
            question: 'When did this begin, and did it start suddenly or build up over time?',
            analysis: 'Collecting onset timing details.',
        });
    }

    if (!hasTrend && !answeredQuestionIds.has('trend')) {
        questionQueue.push({
            id: 'trend',
            question: 'Since it began, has it been getting better, worse, or staying about the same?',
            analysis: 'Collecting symptom trajectory.',
        });
    }

    if (!hasTriggers && !answeredQuestionIds.has('triggers')) {
        questionQueue.push({
            id: 'triggers',
            question: 'Have you noticed anything that reliably makes this better or harder, like stress, sleep, or specific situations?',
            analysis: 'Collecting triggers and relieving factors.',
        });
    }

    if (!hasImpact && !answeredQuestionIds.has('impact')) {
        questionQueue.push({
            id: 'impact',
            question: 'How is this affecting your day-to-day routine, for example sleep, school, work, or relationships?',
            analysis: 'Collecting functional impact details.',
        });
    }

    if (!hasMedicationDetails && !answeredQuestionIds.has('medication')) {
        questionQueue.push({
            id: 'medication',
            question: 'Are you currently taking any medications or treatments for this, and have you noticed any side effects?',
            analysis: 'Collecting treatment and side-effect context.',
        });
    }

    if (!safetyAlreadyAsked && !answeredQuestionIds.has('safety')) {
        questionQueue.push({
            id: 'safety',
            question: 'I ask everyone this for safety: are you having any thoughts of harming yourself or feeling at immediate risk right now?',
            analysis: 'Running baseline safety screen.',
        });
    }

    if (!answeredQuestionIds.has('summary')) {
        questionQueue.push({
            id: 'summary',
            question: 'Thank you, that helps. Before I summarize for your clinician, is there anything else important you want included?',
            analysis: 'Collecting final details before handoff summary.',
        });
    }

    if (questionQueue.length === 0) {
        return {
            role: 'assistant',
            content: 'Thank you. I have enough information and will now send a concise handoff summary to your clinician.',
            risk_score: hasHistoricalSafetyConcern ? 65 : null,
            analysis: 'Fallback triage reached completion and prepared clinician handoff summary.',
            is_complete: true,
        };
    }

    let selectedQuestion = questionQueue.find((item) => item.id !== lastAskedQuestionId) ?? questionQueue[0];

    const normalizedLastAssistant = normalizeForComparison(lastAssistantMessage);
    const normalizedSelectedQuestion = normalizeForComparison(selectedQuestion.question);
    if (normalizedSelectedQuestion.length > 0 && normalizedLastAssistant.includes(normalizedSelectedQuestion)) {
        const alternativeQuestion = questionQueue.find((item) => item.id !== selectedQuestion.id);
        if (alternativeQuestion) {
            selectedQuestion = alternativeQuestion;
        }
    }

    const acknowledgements = [
        'Thank you for sharing that.',
        'I hear you, and that sounds difficult.',
        'Thanks, that context is really helpful.',
    ];
    const acknowledgement = acknowledgements[userMessages.length % acknowledgements.length];

    let content = `${acknowledgement} ${selectedQuestion.question}`;

    if (hasCurrentSafetyConcern) {
        content = 'Thanks for telling me that. Your safety matters most. If you feel at immediate risk, please call emergency services now. If you can, tell me whether you are safe in this moment and if someone can stay with you.';
    }

    if (normalizeForComparison(content) === normalizeForComparison(lastAssistantMessage)) {
        content = 'Thanks for the update. To help your clinician quickly, could you share the single most important thing you want addressed first today?';
    }

    return {
        role: 'assistant',
        content,
        risk_score: hasCurrentSafetyConcern ? 80 : hasHistoricalSafetyConcern ? 65 : null,
        analysis: hasCurrentSafetyConcern
            ? 'Fallback triage detected potential acute safety concern and escalated safety check.'
            : `${selectedQuestion.analysis} Fallback triage response used because live model output was unavailable.`,
        is_complete: false,
    };
}

type ParsedTriageResponse = AssistantResponse & {
    is_complete: boolean;
    next_focus?: TriageFocusDomain;
    phq9_score?: number | null;
    gad7_score?: number | null;
    screening_refused?: boolean;
    phq9_items_answered?: number;
    gad7_items_answered?: number;
};

const TRIAGE_FOCUS_DOMAINS: TriageFocusDomain[] = [
    'onset',
    'trend',
    'triggers',
    'impact',
    'medication',
    'safety',
    'phq9',
    'gad7',
    'summary',
    'complete',
];

const PHQ9_ITEM_QUESTIONS = [
    'Over the past two weeks, how often have you had little interest or pleasure in doing things?',
    'Over the past two weeks, how often have you felt down, depressed, or hopeless?',
    'Over the past two weeks, how often have you had trouble falling or staying asleep, or sleeping too much?',
    'Over the past two weeks, how often have you felt tired or had little energy?',
];

const GAD7_ITEM_QUESTIONS = [
    'Over the past two weeks, how often have you felt nervous, anxious, or on edge?',
    'Over the past two weeks, how often have you not been able to stop or control worrying?',
    'Over the past two weeks, how often have you worried too much about different things?',
    'Over the past two weeks, how often have you had trouble relaxing?',
];

function sanitizeDisplayText(value: string): string {
    return value
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/\s+/g, ' ')
        .trim();
}

function buildSystemPrompt(clinicalSystemPrompt: string): string {
    return `${clinicalSystemPrompt}

Conversation pacing rules (strict):
- Ask exactly ONE follow-up question per reply.
- Do NOT send questionnaires, numbered lists, or multiple screening items in one message.
- Keep content concise (max 2 short paragraphs) and focused on the next single step.
- If using structured screens (like PHQ-9/GAD-7), ask for consent first, then ask one item at a time only.
- Prefer natural clinical conversation over formal assessment dumps.
- Use clinical reasoning over full conversation context to decide the next best single question.
- If the patient gives a negative answer (for example "no", "not really", "same all the time"), treat that topic as answered and move to the next relevant topic.
- Blend PHQ-9 and GAD-7 checks naturally between regular conversational questions, not as a block.
- Do not use em dashes in patient-facing phrasing.

Always respond in JSON format with:
- content: Your empathetic response to the patient, including your next follow-up question.
- risk_score: Integer 0-100 indicating current risk level.
- analysis: Brief internal clinical reasoning for the clinician.
- is_complete: Boolean. Set to true ONLY when you have gathered enough information to form a solid clinical picture and are ready to conclude the assessment.
- next_focus: One of onset|trend|triggers|impact|medication|safety|phq9|gad7|summary|complete indicating which area your next prompt is covering.
- phq9_score: Integer 0-27 or null.
- gad7_score: Integer 0-21 or null.
- screening_refused: Boolean true if the patient explicitly refuses screening questions.
- phq9_items_answered: Integer count of PHQ-9 items answered so far.
- gad7_items_answered: Integer count of GAD-7 items answered so far.`;
}

function getFocusFallbackQuestion(nextFocus: TriageFocusDomain | undefined): string {
    switch (nextFocus) {
        case 'onset':
            return 'When did this begin for you?';
        case 'trend':
            return 'Since it began, has it been getting better, worse, or staying about the same?';
        case 'triggers':
            return 'Have you noticed anything that makes this better or harder, like stress, sleep, or specific situations?';
        case 'impact':
            return 'How is this affecting your day-to-day routine, such as sleep, school, work, or relationships?';
        case 'medication':
            return 'Are you currently taking any medications or treatments for this, and have you noticed side effects?';
        case 'safety':
            return 'I ask everyone this for safety: are you having any thoughts of harming yourself or feeling at immediate risk right now?';
        case 'phq9':
            return 'For the past two weeks, how often have you felt down, depressed, or hopeless?';
        case 'gad7':
            return 'Over the past two weeks, how often have you felt nervous, anxious, or on edge?';
        case 'summary':
            return 'Before I summarize for your clinician, is there anything else important you want included?';
        case 'complete':
            return 'Thank you. I have enough detail to prepare your clinician handoff now.';
        default:
            return 'Could you tell me a bit more about what feels most important right now?';
    }
}

function detectScreeningScaleFromAssistantMessage(content: string): 'phq9' | 'gad7' | null {
    const normalized = content.toLowerCase();

    if (
        hasAnyTerm(normalized, [
            'phq-9',
            'little interest or pleasure',
            'down, depressed, or hopeless',
            'trouble falling or staying asleep',
            'felt tired or had little energy',
        ])
    ) {
        return 'phq9';
    }

    if (
        hasAnyTerm(normalized, [
            'gad-7',
            'nervous, anxious, or on edge',
            'stop or control worrying',
            'worried too much',
            'trouble relaxing',
        ])
    ) {
        return 'gad7';
    }

    return null;
}

function countAnsweredScreeningItems(messages: TriageMessage[]): { phq9: number; gad7: number } {
    const answeredCounts = { phq9: 0, gad7: 0 };

    for (let index = 0; index < messages.length; index += 1) {
        const message = messages[index];
        if (message.role !== 'assistant') continue;

        const scale = detectScreeningScaleFromAssistantMessage(message.content);
        if (!scale) continue;

        for (let scan = index + 1; scan < messages.length; scan += 1) {
            const nextMessage = messages[scan];
            if (nextMessage.role === 'assistant') break;
            if (nextMessage.role === 'user' && nextMessage.content.trim().length > 0) {
                answeredCounts[scale] += 1;
                break;
            }
        }
    }

    return answeredCounts;
}

function getScreeningFallbackQuestion(scale: 'phq9' | 'gad7', answeredCount: number): string {
    const source = scale === 'phq9' ? PHQ9_ITEM_QUESTIONS : GAD7_ITEM_QUESTIONS;
    const question = source[Math.min(answeredCount, source.length - 1)] ?? source[0];
    return `${question} Please answer with: not at all, several days, more than half the days, or nearly every day.`;
}

function enforceSingleQuestionPacing(
    parsed: ParsedTriageResponse,
    messages: TriageMessage[],
): ParsedTriageResponse {
    const compactContent = sanitizeDisplayText(parsed.content);
    const questionMarkCount = (compactContent.match(/\?/g) ?? []).length;
    const numberedItemCount = (compactContent.match(/\b\d+\)\s/g) ?? []).length;
    const bulletItemCount = (compactContent.match(/(?:^|\n)\s*[-*]\s+/g) ?? []).length;
    const hasAssessmentDumpMarkers = /(phq-9|gad-7|please provide your ratings|not at all|several days|more than half the days|nearly every day|0-3 as above)/i.test(compactContent);
    const isOverVerbose = compactContent.length > 420;
    const violatesPacing =
        questionMarkCount > 1 ||
        numberedItemCount >= 2 ||
        bulletItemCount >= 3 ||
        hasAssessmentDumpMarkers ||
        isOverVerbose;

    let nextContent = compactContent;

    if (violatesPacing) {
        const firstQuestionMatch = compactContent.match(/[^?]*\?/);
        const firstQuestion = firstQuestionMatch?.[0]?.trim() ?? '';
        const preface = firstQuestion
            ? compactContent.slice(0, compactContent.indexOf(firstQuestion)).trim()
            : compactContent;
        const fallbackQuestion = getFocusFallbackQuestion(parsed.next_focus);

        if (firstQuestion) {
            nextContent = [preface, firstQuestion].filter(Boolean).join(' ').trim();
        } else {
            nextContent = fallbackQuestion;
        }
    }

    const lastAssistantMessage = [...messages]
        .reverse()
        .find((message) => message.role === 'assistant')
        ?.content ?? '';
    const lastUserMessage = [...messages]
        .reverse()
        .find((message) => message.role === 'user')
        ?.content;
    const answeredQuestionIds = detectAnsweredQuestionIds(messages);

    if (parsed.next_focus === 'safety' && answeredQuestionIds.has('safety') && !detectAcuteSafetyConcern(lastUserMessage)) {
        parsed.next_focus = 'summary';
    }

    if (normalizeForComparison(nextContent) === normalizeForComparison(lastAssistantMessage)) {
        nextContent = sanitizeDisplayText(getFocusFallbackQuestion(parsed.next_focus));
    }

    if (isSafetyEscalationMessage(nextContent) && answeredQuestionIds.has('safety') && !detectAcuteSafetyConcern(lastUserMessage)) {
        nextContent = sanitizeDisplayText(getFocusFallbackQuestion('summary'));
    }

    return {
        ...parsed,
        content: sanitizeDisplayText(nextContent),
        is_complete: parsed.next_focus === 'complete' ? parsed.is_complete : false,
        analysis: [parsed.analysis, violatesPacing ? 'Assistant output normalized to single-question pacing.' : null]
            .filter(Boolean)
            .join(' '),
    };
}

function signalsNoAdditionalInfo(message: string | undefined): boolean {
    if (!message) return false;
    const normalized = message.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!normalized) return false;

    const directMatches = [
        'not in particular',
        'nothing else',
        'thats all',
        "that's all",
        'no that is all',
        'no more',
        'nope thats all',
        'all good',
        'no',
    ];

    if (directMatches.includes(normalized)) {
        return true;
    }

    return /(nothing else|that(?:\'| i)?s all|no more|not really anything else|not in particular)/.test(normalized);
}

function enforceCompletionIfReady(
    parsed: ParsedTriageResponse,
    messages: TriageMessage[],
): ParsedTriageResponse {
    const lastUserMessage = [...messages]
        .reverse()
        .find((message) => message.role === 'user')
        ?.content;

    const noMoreDetails = signalsNoAdditionalInfo(lastUserMessage);
    const answeredQuestionIds = detectAnsweredQuestionIds(messages);
    const userMessageCount = messages.filter((message) => message.role === 'user').length;
    const derivedScreeningCounts = countAnsweredScreeningItems(messages);
    const phq9ItemsAnswered = Math.max(0, Math.round(parsed.phq9_items_answered ?? derivedScreeningCounts.phq9));
    const gad7ItemsAnswered = Math.max(0, Math.round(parsed.gad7_items_answered ?? derivedScreeningCounts.gad7));
    const phq9Available = typeof parsed.phq9_score === 'number' && parsed.phq9_score >= 0 && parsed.phq9_score <= 27;
    const gad7Available = typeof parsed.gad7_score === 'number' && parsed.gad7_score >= 0 && parsed.gad7_score <= 21;
    const minimumScreeningItemsPerScale = 2;
    const screeningCoverageReached = phq9ItemsAnswered >= minimumScreeningItemsPerScale && gad7ItemsAnswered >= minimumScreeningItemsPerScale;
    const screeningCovered = Boolean(parsed.screening_refused) || ((phq9Available && gad7Available) && screeningCoverageReached);

    if (!screeningCovered) {
        const shouldAskPhq9 = phq9ItemsAnswered <= gad7ItemsAnswered;
        const missingFocus: TriageFocusDomain = shouldAskPhq9 ? 'phq9' : 'gad7';
        const fallbackQuestion = shouldAskPhq9
            ? getScreeningFallbackQuestion('phq9', phq9ItemsAnswered)
            : getScreeningFallbackQuestion('gad7', gad7ItemsAnswered);

        return {
            ...parsed,
            is_complete: false,
            next_focus: missingFocus,
            content: sanitizeDisplayText(fallbackQuestion),
            phq9_items_answered: phq9ItemsAnswered,
            gad7_items_answered: gad7ItemsAnswered,
            analysis: [
                parsed.analysis,
                `Completion deferred until blended PHQ-9 and GAD-7 coverage is captured. Current item coverage: PHQ-9 ${phq9ItemsAnswered}, GAD-7 ${gad7ItemsAnswered}.`,
            ].filter(Boolean).join(' '),
        };
    }

    const shouldComplete =
        parsed.next_focus === 'complete' ||
        (parsed.next_focus === 'summary' && noMoreDetails) ||
        (answeredQuestionIds.has('summary') && noMoreDetails) ||
        (answeredQuestionIds.size >= 5 && noMoreDetails && userMessageCount >= 5);

    if (!shouldComplete) {
        return parsed;
    }

    const recentPatientPoints = messages
        .filter((message) => message.role === 'user')
        .map((message) => message.content.trim())
        .filter(Boolean)
        .slice(-3)
        .join(' | ');

    return {
        ...parsed,
        is_complete: true,
        next_focus: 'complete',
        phq9_items_answered: phq9ItemsAnswered,
        gad7_items_answered: gad7ItemsAnswered,
        content: 'Thank you. I have enough information and will now send a concise handoff summary to your clinician.',
        analysis: [
            parsed.analysis,
            'Conversation reached completion and clinician handoff summary is ready.',
            recentPatientPoints ? `Recent patient details: ${recentPatientPoints}` : null,
        ]
            .filter(Boolean)
            .join(' '),
    };
}

function sanitizeParsedResult(raw: Record<string, unknown>): ParsedTriageResponse {
    const content = typeof raw.content === 'string' ? raw.content.trim() : '';
    if (!content) {
        throw new Error('OpenAI response did not contain a usable content field.');
    }

    const riskCandidate = raw.risk_score;
    const riskScoreRaw = typeof riskCandidate === 'number'
        ? riskCandidate
        : typeof riskCandidate === 'string' && riskCandidate.trim().length > 0
            ? Number(riskCandidate)
            : null;
    let normalizedRiskScore: number | null = Number.isFinite(riskScoreRaw) ? Number(riskScoreRaw) : null;
    if (normalizedRiskScore !== null && normalizedRiskScore >= 0 && normalizedRiskScore <= 1) {
        normalizedRiskScore = normalizedRiskScore * 100;
    }
    if (normalizedRiskScore !== null) {
        normalizedRiskScore = Math.max(0, Math.min(100, Math.round(normalizedRiskScore)));
    }

    const nextFocusRaw = typeof raw.next_focus === 'string' ? raw.next_focus.trim().toLowerCase() : '';
    const nextFocus = TRIAGE_FOCUS_DOMAINS.includes(nextFocusRaw as TriageFocusDomain)
        ? (nextFocusRaw as TriageFocusDomain)
        : undefined;
    const phq9ScoreRaw = typeof raw.phq9_score === 'number' ? raw.phq9_score : Number(raw.phq9_score);
    const gad7ScoreRaw = typeof raw.gad7_score === 'number' ? raw.gad7_score : Number(raw.gad7_score);
    const phq9ItemsAnsweredRaw = typeof raw.phq9_items_answered === 'number' ? raw.phq9_items_answered : Number(raw.phq9_items_answered);
    const gad7ItemsAnsweredRaw = typeof raw.gad7_items_answered === 'number' ? raw.gad7_items_answered : Number(raw.gad7_items_answered);
    const phq9Score = Number.isFinite(phq9ScoreRaw) ? Math.max(0, Math.min(27, Math.round(phq9ScoreRaw))) : null;
    const gad7Score = Number.isFinite(gad7ScoreRaw) ? Math.max(0, Math.min(21, Math.round(gad7ScoreRaw))) : null;
    const phq9ItemsAnswered = Number.isFinite(phq9ItemsAnsweredRaw) ? Math.max(0, Math.round(phq9ItemsAnsweredRaw)) : undefined;
    const gad7ItemsAnswered = Number.isFinite(gad7ItemsAnsweredRaw) ? Math.max(0, Math.round(gad7ItemsAnsweredRaw)) : undefined;

    return {
        role: 'assistant',
        content: sanitizeDisplayText(content),
        risk_score: normalizedRiskScore,
        analysis: typeof raw.analysis === 'string' ? sanitizeDisplayText(raw.analysis) : null,
        is_complete: Boolean(raw.is_complete),
        phq9_score: phq9Score,
        gad7_score: gad7Score,
        screening_refused: Boolean(raw.screening_refused),
        ...(phq9ItemsAnswered !== undefined ? { phq9_items_answered: phq9ItemsAnswered } : {}),
        ...(gad7ItemsAnswered !== undefined ? { gad7_items_answered: gad7ItemsAnswered } : {}),
        ...(nextFocus ? { next_focus: nextFocus } : {}),
    };
}

function extractResponsesApiText(response: unknown): string {
    const typedResponse = response as {
        output_text?: string;
        output?: Array<{
            type?: string;
            content?: Array<{ type?: string; text?: string }>;
        }>;
    };

    if (typeof typedResponse.output_text === 'string' && typedResponse.output_text.trim().length > 0) {
        return typedResponse.output_text.trim();
    }

    const output = Array.isArray(typedResponse.output) ? typedResponse.output : [];
    const chunks: string[] = [];
    for (const item of output) {
        if (!item || item.type !== 'message' || !Array.isArray(item.content)) {
            continue;
        }
        for (const part of item.content) {
            if (part?.type === 'output_text' && typeof part.text === 'string' && part.text.trim().length > 0) {
                chunks.push(part.text.trim());
            }
        }
    }

    return chunks.join('\n').trim();
}

function parseTriagePayload(rawText: string): ParsedTriageResponse {
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    return sanitizeParsedResult(parsed);
}

async function generateTriageWithModel(
    openai: OpenAI,
    model: string,
    messages: TriageMessage[],
    systemPrompt: string,
    maxOutputTokens: number,
): Promise<ParsedTriageResponse> {
    if (model.startsWith('gpt-5')) {
        const gpt5OutputTokenBudget = Math.max(maxOutputTokens, 700);
        const response = await openai.responses.create({
            model,
            reasoning: { effort: 'minimal' },
            input: [
                { role: 'system', content: systemPrompt },
                ...messages.map((message) => ({ role: message.role, content: message.content })),
            ],
            max_output_tokens: gpt5OutputTokenBudget,
        });
        const rawText = extractResponsesApiText(response);
        if (!rawText) {
            throw new Error('Responses API returned empty output_text.');
        }
        return parseTriagePayload(rawText);
    }

    const completion = await openai.chat.completions.create({
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
        ],
        response_format: { type: 'json_object' },
        max_tokens: maxOutputTokens,
    }) as { choices?: Array<{ message?: { content?: string | null } }> };

    const content = completion.choices?.[0]?.message?.content ?? '';
    if (!content || content.trim().length === 0) {
        throw new Error('Chat completions returned empty content.');
    }

    return parseTriagePayload(content);
}

async function storeTriageData(
    sessionId: string,
    clinicId: string,
    messages: TriageMessage[],
    assistantResponse: AssistantResponse
) {
    // Create or update session
    const { error: sessionError } = await supabase
        .from('triage_sessions')
        .upsert({
            session_id: sessionId,
            clinic_id: clinicId,
            status: 'active'
        }, { onConflict: 'session_id' });

    if (sessionError) console.error('Session storage error:', sessionError);

    // Get session id
    const { data: session } = await supabase
        .from('triage_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .single();

    if (!session) return;

    // Store messages
    const messageInserts = [
        ...messages.map(msg => ({
            session_id: session.id,
            role: msg.role,
            content: msg.content
        })),
        {
            session_id: session.id,
            role: 'assistant',
            content: assistantResponse.content
        }
    ];

    const { error: messagesError } = await supabase
        .from('messages')
        .insert(messageInserts);

    if (messagesError) console.error('Messages storage error:', messagesError);
}

export async function POST(request: Request) {
    try {
        let userId: string | null = null;
        try {
            userId = await getServerUserId();
        } catch (sessionError) {
            console.error('Triage session lookup failed, continuing as anonymous:', sessionError);
        }

        const demoLimitEnabled = process.env.DEMO_USAGE_LIMIT !== "0";
        const demoLimit = Number(process.env.DEMO_USAGE_LIMIT || "30");
        const demoWindowSeconds = Number(process.env.DEMO_USAGE_WINDOW_SECONDS || `${60 * 60 * 24}`);
        const demoSecretConfigured =
            process.env.NODE_ENV !== "production" ||
            Boolean(process.env.DEMO_USAGE_SECRET || process.env.BETTER_AUTH_SECRET);

        let demoUsageCookieToken: string | null = null;

        if (!userId && demoLimitEnabled && demoSecretConfigured && Number.isFinite(demoLimit) && demoLimit > 0) {
            const cookieStore = await cookies();
            const existingToken = cookieStore.get(getDemoUsageCookieName())?.value;
            const existing = readDemoUsage(existingToken);
            const used = existing?.used ?? 0;

            if (used >= demoLimit) {
                return NextResponse.json(
                    { error: "Demo usage limit reached. Request access for extended evaluation." },
                    { status: 429 }
                );
            }

            const nextToken = createDemoUsageToken({
                ttlSeconds: demoWindowSeconds,
                used: used + 1,
            });
            demoUsageCookieToken = nextToken;
        }

        const { messages, clinicId, sessionId } = (await request.json()) as {
            messages: TriageMessage[];
            clinicId?: string;
            sessionId?: string;
        };

        // Check for OpenAI Key
        const openAiApiKey = getOpenAiApiKey();
        if (openAiApiKey) {
            const primaryModel = getOpenAiModel("gpt-5-nano");
            const fallbackModel = getOpenAiFallbackModel();
            const configuredModels = [primaryModel, fallbackModel]
                .filter((model): model is string => Boolean(model))
                .filter((model, index, all) => all.indexOf(model) === index);
            try {
                const OpenAI = (await import("openai")).default;
                const openai = new OpenAI({ apiKey: openAiApiKey });
                const { CLINICAL_SYSTEM_PROMPT } = await import("@/lib/ai-prompts/system-prompts");
                const maxOutputTokens = getOpenAiMaxOutputTokens(600);
                const systemPrompt = buildSystemPrompt(CLINICAL_SYSTEM_PROMPT);
                const modelCandidates = configuredModels.length > 0 ? configuredModels : ["gpt-5-nano"];

                let result: ParsedTriageResponse | null = null;
                for (const modelCandidate of modelCandidates) {
                    try {
                        result = await generateTriageWithModel(
                            openai,
                            modelCandidate,
                            messages,
                            systemPrompt,
                            maxOutputTokens,
                        );
                        result = enforceSingleQuestionPacing(result, messages);
                        result = enforceCompletionIfReady(result, messages);
                        break;
                    } catch (modelError) {
                        const modelErrorStatus =
                            typeof modelError === 'object' && modelError !== null && 'status' in modelError
                                ? (modelError as { status?: unknown }).status
                                : undefined;
                        const modelErrorCode =
                            typeof modelError === 'object' && modelError !== null && 'code' in modelError
                                ? (modelError as { code?: unknown }).code
                                : undefined;
                        console.error('OpenAI triage model attempt failed:', {
                            model: modelCandidate,
                            apiPath: modelCandidate.startsWith('gpt-5') ? 'responses' : 'chat.completions',
                            status: modelErrorStatus,
                            code: modelErrorCode,
                            error: modelError,
                        });
                    }
                }

                if (!result) {
                    throw new Error('All OpenAI model candidates failed to produce a usable triage response.');
                }

                // Store session and message if clinicId provided
                if (clinicId && sessionId) {
                    await storeTriageData(sessionId, clinicId, messages, {
                        role: "assistant",
                        content: result.content,
                        risk_score: result.risk_score,
                        analysis: result.analysis
                    });
                }

                const json = NextResponse.json({
                    role: "assistant",
                    content: result.content,
                    risk_score: result.risk_score,
                    analysis: result.analysis,
                    is_complete: result.is_complete || false,
                    phq9_score: result.phq9_score ?? null,
                    gad7_score: result.gad7_score ?? null,
                    screening_refused: result.screening_refused ?? false,
                });

                if (demoUsageCookieToken) {
                    json.cookies.set({
                        name: getDemoUsageCookieName(),
                        value: demoUsageCookieToken,
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                        path: "/",
                        maxAge: demoWindowSeconds,
                    });
                }

                return json;
            } catch (openAiError) {
                const openAiErrorStatus =
                    typeof openAiError === 'object' && openAiError !== null && 'status' in openAiError
                        ? (openAiError as { status?: unknown }).status
                        : undefined;
                const openAiErrorCode =
                    typeof openAiError === 'object' && openAiError !== null && 'code' in openAiError
                        ? (openAiError as { code?: unknown }).code
                        : undefined;
                console.error('OpenAI triage generation failed:', {
                    configuredModels,
                    status: openAiErrorStatus,
                    code: openAiErrorCode,
                    error: openAiError,
                });
            }
        }

        // Fallback response when live triage output is unavailable
        const response = buildFallbackTriageResponse(messages);

        // Store session and message if clinicId provided
        if (clinicId && sessionId) {
            await storeTriageData(sessionId, clinicId, messages, response);
        }

        const json = NextResponse.json(response);
        if (demoUsageCookieToken) {
            json.cookies.set({
                name: getDemoUsageCookieName(),
                value: demoUsageCookieToken,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: demoWindowSeconds,
            });
        }
        return json;

    } catch (error) {
        console.error('Triage API Error:', error);
        return NextResponse.json({
            role: 'assistant',
            content:
                'I am having trouble with the automated intake service right now. Please use the clinician takeover button and your clinician will continue manually.',
            risk_score: null,
            analysis: 'Fallback triage response used because a server error occurred before completion.',
            is_complete: false,
        });
    }
}
