/**
 * Risk phrase detection patterns and severity levels
 */

export type RiskPhraseSeverity = "critical" | "high" | "moderate";

export interface RiskPhrasePattern {
    phrase: string;
    severity: RiskPhraseSeverity;
    category: string;
}

export const RISK_PHRASE_PATTERNS: RiskPhrasePattern[] = [
    // Critical risk phrases
    { phrase: "end it all", severity: "critical", category: "Suicidal ideation" },
    { phrase: "ending it", severity: "critical", category: "Suicidal ideation" },
    { phrase: "kill myself", severity: "critical", category: "Suicidal ideation" },
    { phrase: "take my life", severity: "critical", category: "Suicidal ideation" },
    { phrase: "don't want to live", severity: "critical", category: "Suicidal ideation" },
    { phrase: "better off dead", severity: "critical", category: "Suicidal ideation" },

    // High risk phrases
    { phrase: "no point in living", severity: "high", category: "Hopelessness" },
    { phrase: "can't go on", severity: "high", category: "Hopelessness" },
    { phrase: "give up", severity: "high", category: "Hopelessness" },
    { phrase: "no hope", severity: "high", category: "Hopelessness" },
    { phrase: "worthless", severity: "high", category: "Self-worth" },
    { phrase: "burden to everyone", severity: "high", category: "Self-worth" },

    // Moderate risk phrases
    { phrase: "can't cope", severity: "moderate", category: "Coping difficulty" },
    { phrase: "overwhelmed", severity: "moderate", category: "Coping difficulty" },
    { phrase: "falling apart", severity: "moderate", category: "Emotional distress" },
    { phrase: "losing control", severity: "moderate", category: "Emotional distress" },
    { phrase: "can't handle", severity: "moderate", category: "Coping difficulty" },
    { phrase: "completely hopeless", severity: "moderate", category: "Hopelessness" },
];

export function detectRiskPhrases(text: string): Array<{
    phrase: string;
    severity: RiskPhraseSeverity;
    category: string;
    matchedText: string;
    index: number;
}> {
    const detected: Array<{
        phrase: string;
        severity: RiskPhraseSeverity;
        category: string;
        matchedText: string;
        index: number;
    }> = [];

    const lowerText = text.toLowerCase();

    for (const pattern of RISK_PHRASE_PATTERNS) {
        const index = lowerText.indexOf(pattern.phrase.toLowerCase());
        if (index !== -1) {
            detected.push({
                phrase: pattern.phrase,
                severity: pattern.severity,
                category: pattern.category,
                matchedText: text.substring(index, index + pattern.phrase.length),
                index
            });
        }
    }

    return detected;
}

export function getSeverityColor(severity: RiskPhraseSeverity): string {
    switch (severity) {
        case "critical":
            return "bg-red-500/20 text-red-400 border-red-500/50";
        case "high":
            return "bg-orange-500/20 text-orange-400 border-orange-500/50";
        case "moderate":
            return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    }
}
