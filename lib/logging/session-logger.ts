import { PHIRedactor } from './phi-redactor';
import { encrypt } from '../encryption/crypto';
import { Logger } from '../logger';
import { supabase } from '../supabase';

export interface SessionLog {
    sessionId: string;
    timestamp: string;
    riskScore: number;
    phq9Score?: number;
    gad7Score?: number;
    keyPhrases: string[];
    escalated: boolean;
    escalationReason?: string;
}

export class SessionLogger {
    /**
     * Log a session with PHI redaction and encryption
     */
    static async logSession(
        sessionId: string,
        messages: { role: string; content: string }[],
        riskScore: number,
        scores?: { phq9?: number; gad7?: number },
        userId?: string
    ): Promise<SessionLog> {
        // Concatenate all user messages for key phrase extraction
        const userMessages = messages
            .filter(m => m.role === 'user')
            .map(m => m.content)
            .join(' ');

        // Extract key phrases with PHI redaction
        const keyPhrases = PHIRedactor.extractKeyPhrases(userMessages);

        // Determine if escalation occurred
        const escalated = riskScore >= 70;
        const escalationReason = escalated
            ? 'High risk score detected (≥70)'
            : undefined;

        const log: SessionLog = {
            sessionId,
            timestamp: new Date().toISOString(),
            riskScore,
            phq9Score: scores?.phq9,
            gad7Score: scores?.gad7,
            keyPhrases,
            escalated,
            escalationReason,
        };

        // Write to encrypted database
        try {
            if (supabase) {
                // Encrypt sensitive data
                const encryptedKeyPhrases = encrypt(JSON.stringify(keyPhrases));
                const encryptedContext = encrypt(
                    JSON.stringify({
                        messageCount: messages.length,
                        escalationReason: log.escalationReason,
                    })
                );

                const { error } = await supabase
                    .from('session_logs')
                    .insert({
                        session_id: sessionId,
                        user_id: userId,
                        risk_score: riskScore,
                        phq9_score: scores?.phq9,
                        gad7_score: scores?.gad7,
                        encrypted_key_phrases: encryptedKeyPhrases,
                        encrypted_context: encryptedContext,
                        escalated,
                        escalation_reason: escalationReason,
                        escalation_timestamp: escalated ? new Date().toISOString() : null,
                    });

                if (error) {
                    Logger.error('[SESSION_LOG] Failed to write to database', new Error(error.message), { error });
                    // Fallback to console logging
                    Logger.error('[SECURE_LOG_FALLBACK]', new Error('Log fallback'), { log });
                }
            } else {
                // Supabase not configured, log to console
                Logger.error('[SECURE_LOG_FALLBACK]', new Error('Log fallback'), { log });
            }
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            Logger.error('[SESSION_LOG] Unexpected error', err, { log });
            // Fallback to console logging
            Logger.error('[SECURE_LOG_FALLBACK]', new Error('Log fallback'), { log });
        }

        return log;
    }

    /**
     * Log a critical event (immediate escalation)
     */
    static async logCriticalEvent(
        sessionId: string,
        eventType: 'suicidal_ideation' | 'self_harm' | 'medical_emergency',
        redactedContext: string,
        userId?: string
    ): Promise<void> {
        const event = {
            sessionId,
            timestamp: new Date().toISOString(),
            eventType,
            context: PHIRedactor.redact(redactedContext),
            severity: 'CRITICAL',
        };

        Logger.error('[CRITICAL_EVENT]', new Error('Critical critical event'), { event });

        // Write to database
        try {
            if (supabase) {
                const encryptedContext = encrypt(event.context);

                await supabase
                    .from('session_logs')
                    .insert({
                        session_id: sessionId,
                        user_id: userId,
                        risk_score: 100, // Critical events = maximum risk
                        encrypted_context: encryptedContext,
                        escalated: true,
                        escalation_reason: `Critical event: ${eventType}`,
                        escalation_timestamp: new Date().toISOString(),
                    });
            }
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            Logger.error('[CRITICAL_EVENT] Failed to write to database', err);
        }

        // In production, this would also:
        // 1. Trigger real-time clinician alerts
        // 2. Create incident report
        // 3. Send notifications via multiple channels
    }
}
