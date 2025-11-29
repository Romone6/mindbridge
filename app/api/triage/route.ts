import { NextResponse } from 'next/server';

// Mock script for fallback
const MOCK_SCRIPT = [
    {
        role: "assistant",
        content: "Hello. I'm the MindBridge Intake Agent. I'm here to assess your needs and connect you with the right care. To begin, could you briefly describe what brings you here today?",
        risk_score: 10,
        analysis: "Initial contact established. Awaiting patient input."
    },
    {
        role: "assistant",
        content: "I understand. It sounds like you've been carrying a heavy load. How long have you been feeling this way, and has it affected your sleep or daily routine?",
        risk_score: 35,
        analysis: "Patient reports distress. Probing for duration and functional impairment (neurovegetative symptoms)."
    },
    {
        role: "assistant",
        content: "Thank you for sharing that. Given what you've described, I'd like to ask: have you had any thoughts of hurting yourself or ending your life?",
        risk_score: 65,
        analysis: "Standard safety screening (PHQ-9 Item 9). Escalating risk assessment due to reported severity."
    },
    {
        role: "assistant",
        content: "I appreciate your honesty. Based on our conversation, I'm going to recommend a priority consultation with a clinician. I've flagged your case for review within the next hour. In the meantime, here are some immediate coping resources.",
        risk_score: 85,
        analysis: "High risk detected. Protocol: Immediate Escalation. Triage complete."
    }
];

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

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

            return NextResponse.json({
                role: "assistant",
                content: result.content,
                risk_score: result.risk_score,
                analysis: result.analysis
            });
        }

        // Fallback Mock Response
        // Determine turn number based on message count (simple heuristic for demo)
        const turnIndex = Math.floor(messages.length / 2);
        const response = MOCK_SCRIPT[turnIndex] || {
            role: "assistant",
            content: "Thank you. I have gathered enough information. A clinician will review your case shortly.",
            risk_score: 85,
            analysis: "Assessment finalized."
        };

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
