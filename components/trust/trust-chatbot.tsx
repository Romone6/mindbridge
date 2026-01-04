"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Send, ShieldAlert, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { siteConfig } from "@/lib/site-config";
import { getChatResponse, type ChatResponse } from "@/lib/faq/faq-engine";
import type { FaqLink } from "@/lib/faq/faq-data";

const storageKey = "mb_faq_chat_history";

type ChatIntent = ChatResponse["type"];

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: ChatIntent;
  links?: FaqLink[];
};

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const defaultMessages: Message[] = [
  {
    id: createId(),
    role: "assistant",
    intent: "faq",
    content:
      "Hi! I'm the MindBridge FAQ assistant. I can answer questions about security, safety, methodology, and getting started. I can't provide medical advice.",
  },
];

const suggestedQuestions = [
  "Is data encrypted?",
  "Is MindBridge a medical device?",
  "Can we customize triage protocols?",
  "How do I book a demo?",
];

export default function TrustChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return defaultMessages;
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length) {
          return parsed;
        }
      } catch {
        // Ignore malformed cache.
      }
    }
    return defaultMessages;
  });
  const [input, setInput] = useState("");
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isCrisis = useMemo(
    () => messages.some((message) => message.intent === "safety"),
    [messages]
  );

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (toggleRef.current) {
      toggleRef.current.dataset.hydrated = "true";
    }
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isCrisis) return;

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: input.trim(),
    };

    const response = getChatResponse(input.trim(), {
      bookingHref: siteConfig.calendlyDemoUrl,
    });

    const assistantMessage: Message = {
      id: createId(),
      role: "assistant",
      content: response.message,
      intent: response.type,
      links: response.links,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
  };

  const renderLinks = (links?: FaqLink[]) => {
    if (!links?.length) return null;

    return (
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => {
          const isExternal = link.href.startsWith("http");
          return (
            <Button key={link.href} size="sm" variant="outline" asChild>
              <Link
                href={link.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
              >
                {link.label}
              </Link>
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <Button
        data-testid="faq-chat-toggle"
        data-hydrated="false"
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
        size="icon"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        ref={toggleRef}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </Button>
      <SheetContent
        side="right"
        className="flex h-full w-full max-w-md flex-col gap-0 p-0"
        data-testid="faq-chat-panel"
      >
        <div className="border-b border-border bg-muted/30 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-muted p-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">FAQ assistant</h2>
              <p className="text-xs text-muted-foreground">
                Rule-based answers from MindBridge documentation
              </p>
            </div>
          </div>
        </div>

        {isCrisis ? (
          <Panel className="m-4 border-rose-500/30 bg-rose-500/10 p-4 text-sm text-foreground">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-rose-500" />
              <div className="space-y-2">
                <p className="font-semibold text-rose-500">Crisis support needed</p>
                <p>
                  If you are in immediate danger, contact local emergency services right now. In the US,
                  call or text 988. In Australia, call Lifeline at 13 11 14.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/safety">Safety &amp; ethics</Link>
                </Button>
              </div>
            </div>
          </Panel>
        ) : null}

        <div
          className="flex-1 space-y-4 overflow-y-auto p-5"
          data-testid="faq-chat-thread"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((message) => {
            const isAssistant = message.role === "assistant";
            const isSafety = message.intent === "safety";
            return (
              <div
                key={message.id}
                className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                data-role={message.role}
              >
                <div
                  className={`max-w-[85%] rounded-[var(--radius)] px-4 py-3 text-sm ${
                    isAssistant
                      ? isSafety
                        ? "border border-rose-500/30 bg-rose-500/10"
                        : "border border-border bg-muted/30"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isAssistant ? (
                      <Bot className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <User className="mt-0.5 h-4 w-4" />
                    )}
                    <div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {isAssistant ? renderLinks(message.links) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {!isCrisis && messages.length <= 2 ? (
          <div className="border-t border-border bg-background px-5 py-4">
            <p className="text-xs text-muted-foreground">Suggested questions</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedQuestions.map((question) => (
                <Button
                  key={question}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => setInput(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="border-t border-border bg-background p-5"
        >
          <div className="flex items-center gap-2">
            <Input
              data-testid="faq-chat-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                isCrisis
                  ? "Crisis support is required"
                  : "Ask about security, safety, or methodology"
              }
              aria-label="Ask a question"
              disabled={isCrisis}
            />
            <Button
              data-testid="faq-chat-send"
              type="submit"
              size="icon"
              disabled={!input.trim() || isCrisis}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
