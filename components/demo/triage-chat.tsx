"use client";

import { useState, useRef, useEffect } from "react";
import { Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import { ErrorAlert } from "@/components/ui/error-alert";
import { toast } from "sonner";
import { PreChatData } from "@/components/demo/pre-chat-form";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

interface TriageChatProps {
    onAnalysisUpdate: (score: number, analysis: string) => void;
    patientContext: PreChatData | null;
}

export function TriageChat({ onAnalysisUpdate, patientContext }: TriageChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const getTimestamp = () => new Date().toISOString().split('T')[1].slice(0, 8);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading, error]);

    useEffect(() => {
        let initialMessage = "Intake session initialized. Please describe your presenting problem.";

        if (patientContext) {
            initialMessage = `Patient context loaded: ${patientContext.ageRange}yo / ${patientContext.context}. Presenting complaint: ${patientContext.mainConcern}. Please elaborate on current symptoms.`;
        }

        setMessages([{ role: "assistant", content: initialMessage, timestamp: getTimestamp() }]);
        onAnalysisUpdate(10, "Session active. Awaiting patient input.");
    }, [patientContext]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content: input, timestamp: getTimestamp() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/triage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Connection error");
            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, { role: "assistant", content: data.content, timestamp: getTimestamp() }]);
            onAnalysisUpdate(data.risk_score, data.analysis);

        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Error";
            setError(errorMessage);
            toast.error("Network Fault", { description: "Retry connection." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Panel className="flex flex-col h-[600px] border-border bg-background shadow-sm overflow-hidden md:rounded-l-lg rounded-none border-r-0">
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">TRANSCRIPT_LOG</span>
            </div>

            {/* Log View */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-4 bg-background">
                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-4 ${m.role === "assistant" ? "text-primary" : "text-muted-foreground"}`}>
                        <div className="shrink-0 w-20 text-[10px] text-muted-foreground/50 pt-1 select-none">
                            {m.timestamp}
                        </div>
                        <div className="flex-1">
                            <span className={`font-bold mr-2 ${m.role === "assistant" ? "text-primary" : "text-emerald-600"}`}>
                                [{m.role === "assistant" ? "SYSTEM" : "PATIENT"}]
                            </span>
                            <span className="leading-relaxed whitespace-pre-wrap">{m.content}</span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4 animate-pulse opacity-50">
                        <div className="shrink-0 w-20 text-[10px] text-muted-foreground/50 pt-1">
                            {getTimestamp()}
                        </div>
                        <div className="flex-1 text-primary">
                            <span className="font-bold mr-2">[SYSTEM]</span>
                            <span>Processing input stream...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="px-4 py-2 border-l-2 border-red-500 bg-red-50 text-red-700 text-xs">
                        ERROR: {error}
                    </div>
                )}
            </div>

            {/* Clinical Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border bg-muted/10 flex gap-4 items-center">
                <span className="font-mono text-emerald-600 text-xs font-bold">{">"}</span>
                <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Enter patient response..."
                    className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-auto font-mono text-foreground placeholder:text-muted-foreground/50"
                    disabled={isLoading}
                    autoFocus
                />
                <Button type="submit" size="icon" variant="ghost" disabled={isLoading || !input.trim()} className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </Panel>
    );
}
