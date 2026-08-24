type MessageRole = "user" | "assistant" | "system";

export type TriageIntent =
  | "presenting_problem"
  | "timeline"
  | "severity"
  | "functioning"
  | "sleep"
  | "support"
  | "safety";

export type TriageMessageLike = {
  role: MessageRole;
  content: string;
};

export type TriageState = {
  answeredIntents: TriageIntent[];
  nextIntent: TriageIntent | null;
  completionEligible: boolean;
  acuteRiskDetected: boolean;
  recentRefusalDetected: boolean;
  userTurns: number;
};

const INTENT_SEQUENCE: TriageIntent[] = [
  "presenting_problem",
  "timeline",
  "severity",
  "functioning",
  "sleep",
  "support",
  "safety",
];

const CORE_COMPLETION_INTENTS: TriageIntent[] = [
  "presenting_problem",
  "timeline",
  "severity",
  "functioning",
  "safety",
];

const ACUTE_RISK_PATTERN =
  /\b(suicid(?:e|al)|kill myself|hurt myself|self harm|self-harm|end my life|can't go on|want to die|overdose|homicid(?:e|al)|hurt someone)\b/i;

const SAFETY_DISCUSSION_PATTERN =
  /\b(self harm|self-harm|harm myself|harming myself|harm yourself|harming yourself|harm someone|harming someone|suicid(?:e|al)|homicid(?:e|al)|hurt myself|hurt someone|thoughts? of harm|thoughts? of harming)\b/i;

const REFUSAL_PATTERN =
  /\b(i do not want to answer|i don't want to answer|prefer not to answer|skip this|no comment|rather not say)\b/i;

const QUESTION_BY_INTENT: Record<TriageIntent, string> = {
  presenting_problem:
    "Can you tell me the main concern that brought you in today?",
  timeline: "When did these symptoms begin, and have they changed recently?",
  severity: "How intense do these symptoms feel for you right now?",
  functioning:
    "How are these symptoms affecting your daily life, work, or relationships?",
  sleep: "How have your sleep and energy been over the past week?",
  support: "Who do you currently have for support when things feel difficult?",
  safety:
    "Are you having any current thoughts about harming yourself or someone else?",
};

function dedupeIntents(intents: TriageIntent[]): TriageIntent[] {
  return Array.from(new Set(intents));
}

function detectAcuteRisk(message: string): boolean {
  return ACUTE_RISK_PATTERN.test(message);
}

function detectSafetyDiscussion(message: string): boolean {
  return SAFETY_DISCUSSION_PATTERN.test(message);
}

function detectRefusal(message: string): boolean {
  return REFUSAL_PATTERN.test(message);
}

export function getTriageQuestion(intent: TriageIntent | null): string {
  if (!intent) {
    return "Is there anything else you feel your clinician should know before we finish this intake?";
  }

  return QUESTION_BY_INTENT[intent];
}

export function deriveTriageState(messages: TriageMessageLike[]): TriageState {
  const userMessages = messages.filter((m) => m.role === "user");
  const answeredIntents: TriageIntent[] = [];

  userMessages.forEach((_message, index) => {
    const mappedIntent = INTENT_SEQUENCE[index];
    if (mappedIntent) {
      answeredIntents.push(mappedIntent);
    }
  });

  const acuteRiskDetected = userMessages.some((m) => detectAcuteRisk(m.content));
  const safetyDiscussed = userMessages.some((m) => detectSafetyDiscussion(m.content));
  if (acuteRiskDetected || safetyDiscussed) {
    answeredIntents.push("safety");
  }

  const recentUserMessage = userMessages.at(-1)?.content ?? "";
  const recentRefusalDetected = detectRefusal(recentUserMessage);

  const normalizedAnsweredIntents = dedupeIntents(answeredIntents);
  const nextIntent =
    INTENT_SEQUENCE.find((intent) => !normalizedAnsweredIntents.includes(intent)) ??
    null;

  const completionEligible =
    CORE_COMPLETION_INTENTS.every((intent) =>
      normalizedAnsweredIntents.includes(intent),
    ) && userMessages.length >= 5;

  return {
    answeredIntents: normalizedAnsweredIntents,
    nextIntent,
    completionEligible,
    acuteRiskDetected,
    recentRefusalDetected,
    userTurns: userMessages.length,
  };
}

function cleanWhitespace(content: string): string {
  return content.replace(/\s+/g, " ").trim();
}

export function enforceOneQuestion(
  content: string,
  intent: TriageIntent | null,
): string {
  const normalized = cleanWhitespace(content);
  if (!normalized) {
    return getTriageQuestion(intent);
  }

  const questionMatches = normalized.match(/\?/g) ?? [];
  if (questionMatches.length === 1) {
    return normalized;
  }

  if (questionMatches.length > 1) {
    const firstQuestion = normalized.split("?")[0]?.trim();
    if (firstQuestion) {
      return `${firstQuestion}?`;
    }
  }

  const fallbackQuestion = getTriageQuestion(intent);
  const punctuated = /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
  return `${punctuated} ${fallbackQuestion}`;
}

export function buildFallbackResponseContent(state: TriageState): string {
  if (state.acuteRiskDetected) {
    return "Thank you for telling me that. Your safety matters most right now. Are you in immediate danger at this moment?";
  }

  if (state.completionEligible) {
    return "Thank you. I have enough information to prepare a clear summary for your clinician now.";
  }

  const question = getTriageQuestion(state.nextIntent);

  if (state.recentRefusalDetected) {
    return `Thank you for sharing that boundary. ${question}`;
  }

  return `Thank you for sharing that. ${question}`;
}
