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

type FallbackQuestionId = 'onset' | 'trend' | 'triggers' | 'impact' | 'medication' | 'safety' | 'summary';

function normalizeForComparison(value: string): string {
    return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function hasAnyTerm(text: string, terms: string[]): boolean {
    return terms.some((term) => text.includes(term));
}

function detectLastAssistantQuestionId(lastAssistantMessage: string): FallbackQuestionId | null {
    const lastAssistant = lastAssistantMessage.toLowerCase();

    if (hasAnyTerm(lastAssistant, ['when this started', 'when did this start', 'how long this has'])) return 'onset';
    if (hasAnyTerm(lastAssistant, ['getting better or worse', 'better, worse, or staying', 'same over time'])) return 'trend';
    if (hasAnyTerm(lastAssistant, ['makes it better', 'makes it worse', 'triggers'])) return 'triggers';
    if (hasAnyTerm(lastAssistant, ['day-to-day', 'daily activities', 'sleep, school, work'])) return 'impact';
    if (hasAnyTerm(lastAssistant, ['dose', 'medication', 'side effects'])) return 'medication';
    if (hasAnyTerm(lastAssistant, ['thoughts of harming yourself', 'immediate danger', 'safety concern'])) return 'safety';
    if (hasAnyTerm(lastAssistant, ['anything else', 'before i summarize'])) return 'summary';

    return null;
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

    const hasOnset = hasAnyTerm(lowerUserText, [' started ', ' started', ' since ', ' ago', ' for ', 'week', 'month', 'year', 'day']);
    const hasTrend = hasAnyTerm(lowerUserText, ['better', 'worse', 'improv', 'same', 'fluctuat', 'comes and goes']);
    const hasTriggers = hasAnyTerm(lowerUserText, ['trigger', 'makes it worse', 'makes it better', 'helps when', 'harder when', 'easily overstimulated']);
    const hasImpact = hasAnyTerm(lowerUserText, ['sleep', 'school', 'work', 'daily', 'concentration', 'relationships', 'libido', 'energy', 'appetite']);
    const hasMedicationDetails = hasAnyTerm(lowerUserText, ['sertraline', 'medication', 'dose', 'mg', 'side effect', 'prescribed', 'started taking']);
    const hasSafetyConcern = hasAnyTerm(lowerUserText, ['suicid', 'self harm', 'harm myself', 'kill myself', 'immediate danger', 'can\'t stay safe']);
    const safetyAlreadyAsked = hasAnyTerm(lowerAssistantText, ['thoughts of harming yourself', 'immediate danger', 'safety concern']);

    const questionQueue: { id: FallbackQuestionId; question: string; analysis: string }[] = [];

    if (!hasOnset) {
        questionQueue.push({
            id: 'onset',
            question: 'When did this begin, and did it start suddenly or build up over time?',
            analysis: 'Collecting onset timing details.',
        });
    }

    if (!hasTrend) {
        questionQueue.push({
            id: 'trend',
            question: 'Since it began, has it been getting better, worse, or staying about the same?',
            analysis: 'Collecting symptom trajectory.',
        });
    }

    if (!hasTriggers) {
        questionQueue.push({
            id: 'triggers',
            question: 'Have you noticed anything that reliably makes this better or harder, like stress, sleep, or specific situations?',
            analysis: 'Collecting triggers and relieving factors.',
        });
    }

    if (!hasImpact) {
        questionQueue.push({
            id: 'impact',
            question: 'How is this affecting your day-to-day routine, for example sleep, school, work, or relationships?',
            analysis: 'Collecting functional impact details.',
        });
    }

    if (!hasMedicationDetails) {
        questionQueue.push({
            id: 'medication',
            question: 'Are you currently taking any medications or treatments for this, and have you noticed any side effects?',
            analysis: 'Collecting treatment and side-effect context.',
        });
    }

    if (!safetyAlreadyAsked) {
        questionQueue.push({
            id: 'safety',
            question: 'I ask everyone this for safety: are you having any thoughts of harming yourself or feeling at immediate risk right now?',
            analysis: 'Running baseline safety screen.',
        });
    }

    questionQueue.push({
        id: 'summary',
        question: 'Thank you, that helps. Before I summarize for your clinician, is there anything else important you want included?',
        analysis: 'Collecting final details before handoff summary.',
    });

    const selectedQuestion = questionQueue.find((item) => item.id !== lastAskedQuestionId) ?? questionQueue[0];

    const acknowledgements = [
        'Thank you for sharing that.',
        'I hear you, and that sounds difficult.',
        'Thanks, that context is really helpful.',
    ];
    const acknowledgement = acknowledgements[userMessages.length % acknowledgements.length];

    let content = `${acknowledgement} ${selectedQuestion.question}`;

    if (hasSafetyConcern) {
        content = 'Thanks for telling me that. Your safety matters most. If you feel at immediate risk, please call emergency services now. If you can, tell me whether you are safe in this moment and if someone can stay with you.';
    }

    if (
        normalizeForComparison(content) === normalizeForComparison(lastAssistantMessage)
    ) {
        content = 'Thanks for the update. To help your clinician quickly, could you share the single most important thing you want addressed first today?';
    }

    return {
        role: 'assistant',
        content,
        risk_score: hasSafetyConcern ? 80 : null,
        analysis: hasSafetyConcern
            ? 'Fallback triage detected potential acute safety concern and escalated safety check.'
            : `${selectedQuestion.analysis} Fallback triage response used because live model output was unavailable.`,
        is_complete: false,
    };
}

type ParsedTriageResponse = AssistantResponse & { is_complete: boolean };

function buildSystemPrompt(clinicalSystemPrompt: string): string {
    return `${clinicalSystemPrompt}

Always respond in JSON format with:
- content: Your empathetic response to the patient, including your next follow-up question.
- risk_score: Integer 0-100 indicating current risk level.
- analysis: Brief internal clinical reasoning for the clinician.
- is_complete: Boolean. Set to true ONLY when you have gathered enough information to form a solid clinical picture and are ready to conclude the assessment.`;
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

    return {
        role: 'assistant',
        content,
        risk_score: normalizedRiskScore,
        analysis: typeof raw.analysis === 'string' ? raw.analysis : null,
        is_complete: Boolean(raw.is_complete),
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
        const gpt5OutputTokenBudget = Math.max(maxOutputTokens, 1200);
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
                    is_complete: result.is_complete || false
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
