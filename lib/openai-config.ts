function normalizeEnvString(value: string | undefined): string | undefined {
    if (!value) {
        return undefined;
    }

    let normalized = value.trim();

    for (let i = 0; i < 3; i += 1) {
        const hasDoubleQuotes = normalized.startsWith('"') && normalized.endsWith('"');
        const hasSingleQuotes = normalized.startsWith("'") && normalized.endsWith("'");

        if (!hasDoubleQuotes && !hasSingleQuotes) {
            break;
        }

        normalized = normalized.slice(1, -1).trim();
    }

    normalized = normalized
        .replace(/\\+n/g, '')
        .replace(/\\+r/g, '')
        .replace(/\r/g, '')
        .replace(/\n/g, '')
        .trim();

    return normalized.length > 0 ? normalized : undefined;
}

export function getOpenAiApiKey(): string | undefined {
    return normalizeEnvString(process.env.OPENAI_API_KEY);
}

export function getOpenAiModel(defaultModel: string): string {
    return normalizeEnvString(process.env.OPENAI_MODEL) ?? defaultModel;
}

export function getOpenAiMaxOutputTokens(defaultTokens: number): number {
    const parsed = Number(normalizeEnvString(process.env.OPENAI_MAX_OUTPUT_TOKENS));

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return defaultTokens;
    }

    return parsed;
}
