"use client";

import React, { createContext, useContext, useRef, useEffect } from "react";
import { Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Terminal } from "lucide-react";
import { Message } from "@/hooks/use-triage-session";
import { cn } from "@/lib/utils";

interface TriageContextValue {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    getTimestamp: () => string;
}

const TriageContext = createContext<TriageContextValue | undefined>(undefined);

function useTriageContext() {
    const context = useContext(TriageContext);
    if (!context) {
        throw new Error("Triage compound components must be used within TriageInterface");
    }
    return context;
}

export function TriageInterface({ 
    children, 
    messages, 
    isLoading, 
    error, 
    getTimestamp,
    className
}: Omit<TriageContextValue, "getTimestamp"> & { getTimestamp?: () => string; children: React.ReactNode; className?: string }) {
    const resolvedGetTimestamp = getTimestamp ?? (() => new Date().toISOString().split('T')[1].slice(0, 8));
    return (
        <TriageContext.Provider value={{ messages, isLoading, error, getTimestamp: resolvedGetTimestamp }}>
            <Panel className={cn("flex flex-col h-[600px] border-border bg-background shadow-sm overflow-hidden md:rounded-l-lg rounded-none border-r-0", className)}>
                {children}
            </Panel>
        </TriageContext.Provider>
    );
}

TriageInterface.Header = function TriageHeader({ title = "TRANSCRIPT_LOG" }: { title?: string }) {
    return (
        <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{title}</span>
        </div>
    );
};

TriageInterface.Log = function TriageLog() {
    const { messages, isLoading, error, getTimestamp } = useTriageContext();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading, error]);

    return (
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
    );
};

TriageInterface.Input = function TriageInput({ 
    value, 
    onChange, 
    onSubmit, 
    placeholder = "Enter patient response..." 
}: { 
    value: string; 
    onChange: (val: string) => void; 
    onSubmit: (e: React.FormEvent) => void;
    placeholder?: string;
}) {
    const { isLoading } = useTriageContext();

    return (
        <form onSubmit={onSubmit} className="p-4 border-t border-border bg-muted/10 flex gap-4 items-center">
            <span className="font-mono text-emerald-600 text-xs font-bold">{">"}</span>
            <Input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-auto font-mono text-foreground placeholder:text-muted-foreground/50"
                disabled={isLoading}
                autoFocus
                aria-label="Patient response input"
                aria-describedby="chat-input-description"
            />
            <span id="chat-input-description" className="sr-only">
                {placeholder}
            </span>
            <Button 
                type="submit" 
                size="icon" 
                variant="ghost" 
                disabled={isLoading || !value.trim()} 
                className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Send message"
                aria-busy={isLoading}
            >
                <Send className="h-4 w-4" />
            </Button>
        </form>
    );
};
