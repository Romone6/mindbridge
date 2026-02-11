'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/site-config";

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function TrustChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "👋 Hi! I'm the MindBridge Trust Assistant. I can answer your questions about our security practices, privacy policies, and compliance certifications. How can I help you today?"
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ block: 'end' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/trust-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage]
                })
            });

            const data: { content?: string; error?: string } = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.content || `I can help with security and privacy questions. If this issue continues, contact ${siteConfig.contactEmails.support}.`
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `I apologize, but I encountered an error. Please try again or contact ${siteConfig.contactEmails.support} for assistance.`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestedQuestions = [
        'Are you HIPAA compliant?',
        'Is my data encrypted?',
        'What security measures do you use?'
    ];

    return (
        <>
            {/* Chat Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
                size="icon"
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {isOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
            </Button>

            {/* Chat Window */}
            {isOpen && (
                <Panel className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] overflow-hidden shadow-lg">
                    <div className="flex flex-col h-[500px]">
                        <div className="border-b border-border bg-muted/30 p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-muted p-2">
                                    <Bot className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">Trust assistant</h3>
                                    <p className="text-xs text-muted-foreground">Security and compliance guidance</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-[var(--radius)] px-4 py-3 text-sm ${
                                            message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted/30 text-foreground border border-border'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            {message.role === 'assistant' && (
                                                <Bot className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                            )}
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                            {message.role === 'user' && (
                                                <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="rounded-[var(--radius)] px-4 py-3 border border-border bg-muted/30">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {messages.length <= 2 && (
                            <div className="px-4 py-3 border-t border-border bg-background">
                                <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedQuestions.map((q, i) => (
                                        <Button
                                            key={i}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setInput(q)}
                                            className="text-xs"
                                        >
                                            {q}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about security, privacy..."
                                    className="flex-1"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </form>
                    </div>
                </Panel>
            )}
        </>
    );
}
