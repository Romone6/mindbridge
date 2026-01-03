"use client";

import { TranscriptMessage, RiskPhrase } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef } from "react";

interface TranscriptViewerProps {
    messages: TranscriptMessage[];
    riskPhrases: RiskPhrase[];
}

export function TranscriptViewer({ messages, riskPhrases }: TranscriptViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to bottom on load
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, []);

    const highlightRiskPhrases = (content: string, messageIndex: number) => {
        const phrasesForMessage = riskPhrases.filter(rp => rp.messageIndex === messageIndex);

        if (phrasesForMessage.length === 0) {
            return content;
        }

        let highlighted = content;
        phrasesForMessage.forEach(rp => {
            const regex = new RegExp(`(${rp.phrase})`, 'gi');
            highlighted = highlighted.replace(
                regex,
                `<mark class="bg-yellow-500/30 text-yellow-200 px-1 rounded">$1</mark>`
            );
        });

        return highlighted;
    };

    return (
        <div ref={containerRef} className="max-h-[600px] overflow-y-auto space-y-4 p-4">
            {messages.map((msg, index) => (
                <div
                    key={index}
                    className={`flex gap-3 ${msg.role === "patient" ? "flex-row-reverse" : ""}`}
                >
                    {/* Avatar */}
                    <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${msg.role === "ai"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            }`}
                    >
                        {msg.role === "ai" ? "AI" : "PT"}
                    </div>

                    {/* Message Bubble */}
                    <div className="flex flex-col gap-1 max-w-[75%]">
                        <div className="text-xs text-muted-foreground px-3">
                            {msg.role === "ai" ? "MindBridge AI" : "Patient"}
                            <span className="ml-2 opacity-60">
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                        <div
                            className={`p-3 rounded-lg ${msg.role === "ai"
                                    ? "bg-white/5 border border-white/10"
                                    : "bg-blue-500/10 border border-blue-500/30"
                                }`}
                        >
                            <p
                                className="text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: msg.role === "patient"
                                        ? highlightRiskPhrases(msg.content, index)
                                        : msg.content
                                }}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
