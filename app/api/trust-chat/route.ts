import { NextResponse } from 'next/server';
import { searchKnowledge, getSystemPrompt } from '@/lib/compliance/compliance-knowledge';
import { getOpenAiApiKey, getOpenAiMaxOutputTokens, getOpenAiModel } from '@/lib/openai-config';
import { siteConfig } from '@/lib/site-config';

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        const lastUserMessage = messages
            .filter((m: { role: string }) => m.role === 'user')
            .pop();

        if (!lastUserMessage) {
            return NextResponse.json(
                { error: 'No user message found' },
                { status: 400 }
            );
        }

        // Check for OpenAI API key for AI-powered responses
        const openAiApiKey = getOpenAiApiKey();
        if (openAiApiKey) {
            try {
                const OpenAI = (await import('openai')).default;
                const openai = new OpenAI({ apiKey: openAiApiKey });

                const completion = await openai.chat.completions.create({
                    model: getOpenAiModel('gpt-4o-mini'),
                    messages: [
                        { role: 'system', content: getSystemPrompt() },
                        ...messages
                    ],
                    max_tokens: getOpenAiMaxOutputTokens(500),
                    temperature: 0.7
                });

                const response = completion.choices[0].message.content ||
                    `I apologize, but I was unable to generate a response. Please contact ${siteConfig.contactEmails.support} for assistance.`;

                return NextResponse.json({
                    role: 'assistant',
                    content: response
                });
            } catch (aiError) {
                console.error('OpenAI API error:', aiError);
                // Fall through to knowledge base search
            }
        }

        // Fallback: Search knowledge base directly
        const relevantKnowledge = searchKnowledge(lastUserMessage.content);

        let response: string;
        if (relevantKnowledge.length > 0) {
            // Use the best matching answer
            response = relevantKnowledge[0].answer;

            // If there are more relevant topics, mention them
            if (relevantKnowledge.length > 1) {
                response += '\n\nI can also help you with related topics like: ' +
                    relevantKnowledge.slice(1).map(k => k.question.replace('?', '')).join(', ') + '.';
            }
        } else {
            response = "I don't have specific information about that topic in my knowledge base. " +
                "For detailed questions about our security, privacy, or compliance practices, " +
                `please contact our security team at ${siteConfig.contactEmails.support}. ` +
                "You can also explore our Privacy Policy and Terms of Service linked below.";
        }

        return NextResponse.json({
            role: 'assistant',
            content: response
        });

    } catch (error) {
        console.error('Trust Chat API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
