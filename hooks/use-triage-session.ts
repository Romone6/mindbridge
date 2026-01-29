"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { PreChatData } from "@/components/demo/pre-chat-form";

export interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

export interface TriageSessionOptions {
    patientContext?: PreChatData | null;
    onAnalysisUpdate?: (score: number, analysis: string) => void;
}

export function useTriageSession({ patientContext, onAnalysisUpdate }: TriageSessionOptions = {}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const getTimestamp = useCallback(() => new Date().toISOString().split('T')[1].slice(0, 8), []);

    // Initialize session
    useEffect(() => {
        let initialMessage = "Intake session initialized. Please describe your presenting problem.";

        if (patientContext) {
            initialMessage = `Patient context loaded: ${patientContext.ageRange}yo / ${patientContext.context}. Presenting complaint: ${patientContext.mainConcern}. Please elaborate on current symptoms.`;
        }

        setMessages([{ role: "assistant", content: initialMessage, timestamp: getTimestamp() }]);
        if (onAnalysisUpdate) {
            onAnalysisUpdate(10, "Session active. Awaiting patient input.");
        }
    }, [patientContext, getTimestamp, onAnalysisUpdate]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        const userMsg: Message = { role: "user", content, timestamp: getTimestamp() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/triage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content })) 
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Connection error");
            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, { role: "assistant", content: data.content, timestamp: getTimestamp() }]);
            
            if (onAnalysisUpdate) {
                onAnalysisUpdate(data.risk_score, data.analysis);
            }

        } catch (error) {
            console.error(error);
            const errorMessage = error instanceof Error ? error.message : "Error";
            setError(errorMessage);
            toast.error("Network Fault", { description: "Retry connection." });
        } finally {
            setIsLoading(false);
        }
    };

    const clearMessages = () => setMessages([]);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearMessages,
        getTimestamp
    };
}
