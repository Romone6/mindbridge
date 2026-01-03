import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
        const { messages, clinicId, sessionId } = (await request.json()) as {
            messages: TriageMessage[];
            clinicId?: string;
            sessionId?: string;
        };

        // Check for OpenAI Key
        if (process.env.OPENAI_API_KEY) {
            const OpenAI = (await import("openai")).default;
            const openai = new OpenAI();

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are the MindBridge Intake Agent, a clinical AI assistant. 
            Your goal is to empathetically gather information, assess risk using PHQ-9/GAD-7 heuristics, and determine a Risk Score (0-100).
            
            - 0-30: Low Risk (Mild anxiety/stress)
            - 31-70: Moderate Risk (Significant distress, functional impairment)
            - 71-100: High Risk (Self-harm, severe depression, crisis)

            Always respond in JSON format with:
            - content: Your response to the patient (empathetic, professional).
            - risk_score: Integer 0-100.
            - analysis: Brief clinical reasoning (e.g., "Patient expresses hopelessness, flagging for review.").`
                    },
                    ...messages
                ],
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(completion.choices[0].message.content || "{}");

            // Store session and message if clinicId provided
            if (clinicId && sessionId) {
                await storeTriageData(sessionId, clinicId, messages, {
                    role: "assistant",
                    content: result.content,
                    risk_score: result.risk_score,
                    analysis: result.analysis
                });
            }

            return NextResponse.json({
                role: "assistant",
                content: result.content,
                risk_score: result.risk_score,
                analysis: result.analysis
            });
        }

        // Fallback response when live triage is unavailable
        const response: AssistantResponse = {
            role: "assistant",
            content: "Live triage is unavailable. Configure an API key to enable clinical assessments.",
            risk_score: null,
            analysis: "No data yet."
        };

        // Store session and message if clinicId provided
        if (clinicId && sessionId) {
            await storeTriageData(sessionId, clinicId, messages, response);
        }

        // Simulate "Thinking" delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        return NextResponse.json(response);

    } catch (error) {
        console.error('Triage API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
