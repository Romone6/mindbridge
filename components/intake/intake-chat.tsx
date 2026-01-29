"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface IntakeChatProps {
    clinicId: string;
    sessionId: string;
    onComplete: (isComplete: boolean, analysis: string, riskScore: number | null) => void;
}

export function IntakeChat({ clinicId, sessionId, onComplete }: IntakeChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hello. I'm MindBridge's intake assistant. I'm here to listen and help gather information for your clinician. How have you been feeling lately?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/triage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
                    clinicId,
                    sessionId,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Connection error");

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.content },
            ]);

            onComplete(data.is_complete, data.analysis, data.risk_score);
        } catch (error) {
            console.error("Chat error:", error);
            // In a production app, we'd show a toast here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] w-full">
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex items-start gap-3 max-w-[85%]",
                            m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        <div
                            className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                m.role === "assistant"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            {m.role === "assistant" ? (
                                <Bot className="h-4 w-4" />
                            ) : (
                                <User className="h-4 w-4" />
                            )}
                        </div>
                        <div
                            className={cn(
                                "rounded-2xl px-4 py-2 text-sm leading-relaxed",
                                m.role === "assistant"
                                    ? "bg-muted text-foreground rounded-tl-none font-medium"
                                    : "bg-primary text-primary-foreground rounded-tr-none"
                            )}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 mr-auto max-w-[85%]">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 animate-pulse">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-muted text-foreground rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            <span className="text-sm text-muted-foreground italic">
                                Thinking...
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <form
                onSubmit={handleSend}
                className="p-4 border-t border-border bg-background mt-auto flex gap-2"
            >
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1 rounded-full px-4 h-11 border-muted focus-visible:ring-primary/20 transition-all"
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    size="icon"
                    className="h-11 w-11 rounded-full shrink-0 shadow-md hover:scale-105 active:scale-95 transition-transform"
                    disabled={isLoading || !input.trim()}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
