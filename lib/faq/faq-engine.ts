import {
  bookingTriggers,
  faqEntries,
  safetyTriggers,
  type FaqEntry,
  type FaqLink,
} from "@/lib/faq/faq-data";

export type ChatResponse = {
  type: "safety" | "booking" | "faq" | "fallback";
  message: string;
  links?: FaqLink[];
  matchedId?: string;
};

type ChatResponseOptions = {
  bookingHref?: string;
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const containsAny = (haystack: string, needles: string[]) =>
  needles.some((needle) => haystack.includes(needle));

const scoreEntry = (entry: FaqEntry, normalized: string) =>
  entry.keywords.reduce((score, keyword) => {
    if (!keyword) return score;
    return normalized.includes(keyword) ? score + keyword.split(" ").length : score;
  }, 0);

const findBestEntry = (normalized: string) => {
  const scored = faqEntries
    .map((entry) => ({
      entry,
      score: scoreEntry(entry, normalized),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.entry ?? null;
};

export const getChatResponse = (
  input: string,
  options: ChatResponseOptions = {}
): ChatResponse => {
  const normalized = normalize(input);

  if (containsAny(normalized, safetyTriggers)) {
    return {
      type: "safety",
      message:
        "If you are in immediate danger or thinking about self-harm, please contact local emergency services right now. " +
        "In the US, call or text 988. In Australia, call Lifeline at 13 11 14. MindBridge cannot provide crisis support.",
      links: [{ label: "Safety & ethics", href: "/safety" }],
    };
  }

  if (containsAny(normalized, bookingTriggers)) {
    const bookingHref = options.bookingHref || "/demo";
    return {
      type: "booking",
      message:
        "Happy to help you book a demo. You can schedule a walkthrough or explore the demo experience below.",
      links: [
        { label: "Book a demo", href: bookingHref },
        { label: "Explore demo", href: "/demo" },
      ],
    };
  }

  const entry = findBestEntry(normalized);
  if (entry) {
    return {
      type: "faq",
      message: entry.answer,
      links: entry.links,
      matchedId: entry.id,
    };
  }

  return {
    type: "fallback",
    message:
      "I can answer questions about security, safety, methodology, and getting started. " +
      "If you'd like to explore the product, these links are a good next step.",
    links: [
      { label: "Explore demo", href: "/demo" },
      { label: "Research hub", href: "/research" },
    ],
  };
};
