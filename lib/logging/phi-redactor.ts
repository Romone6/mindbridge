/**
 * PHI Redactor for session logging
 * Redacts personally identifiable information to comply with HIPAA and privacy regulations
 */

export class PHIRedactor {
    private static readonly NAME_PATTERN = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
    private static readonly EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    private static readonly PHONE_PATTERN = /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
    private static readonly SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g;
    private static readonly LOCATION_PATTERN = /\b\d{1,5}\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir)\b/gi;
    private static readonly ZIP_PATTERN = /\b\d{5}(?:-\d{4})?\b/g;

    /**
     * Redact all PHI from a text string
     */
    static redact(text: string): string {
        let redacted = text;

        // Redact email addresses
        redacted = redacted.replace(this.EMAIL_PATTERN, '[EMAIL]');

        // Redact phone numbers
        redacted = redacted.replace(this.PHONE_PATTERN, '[PHONE]');

        // Redact SSN
        redacted = redacted.replace(this.SSN_PATTERN, '[SSN]');

        // Redact street addresses
        redacted = redacted.replace(this.LOCATION_PATTERN, '[ADDRESS]');

        // Redact ZIP codes
        redacted = redacted.replace(this.ZIP_PATTERN, '[ZIP]');

        // Redact potential names (2+ capitalized words in sequence)
        // This is imperfect but catches most obvious cases
        redacted = redacted.replace(this.NAME_PATTERN, '[NAME]');

        return redacted;
    }

    /**
     * Extract key phrases while redacting PHI
     */
    static extractKeyPhrases(text: string, maxPhrases: number = 5): string[] {
        const redacted = this.redact(text);

        // Simple keyword extraction - in production you'd use NLP
        const keywords = [
            'suicide', 'kill myself', 'end it', 'harm myself', 'cut myself',
            'overdose', 'jump', 'hang', 'gun', 'pills',
            'hopeless', 'worthless', 'burden', 'no point',
            'can\'t go on', 'better off dead', 'no way out',
            'depression', 'anxiety', 'panic', 'insomnia',
            'voices', 'hallucination', 'paranoid'
        ];

        const lowerText = redacted.toLowerCase();
        const foundPhrases: string[] = [];

        for (const keyword of keywords) {
            if (lowerText.includes(keyword) && foundPhrases.length < maxPhrases) {
                foundPhrases.push(keyword);
            }
        }

        return foundPhrases;
    }
}
