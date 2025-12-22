"use client";

import { Panel } from "@/components/ui/panel";
import { Star } from "lucide-react";

const testimonials = [
    {
        quote: "It felt like talking to a real therapist. I got help in 3 minutes instead of waiting weeks.",
        author: "Beta User",
        role: "Patient",
        rating: 5,
    },
    {
        quote: "MindBridge handles the paperwork so I can focus on my patients. It's a game changer.",
        author: "Dr. Sarah Chen",
        role: "Clinical Psychologist",
        rating: 5,
    },
    {
        quote: "The risk detection is incredibly accurate. It caught a critical case we might have missed.",
        author: "Mark Davis",
        role: "Clinic Director",
        rating: 5,
    },
];

export function TestimonialsSection() {
    return (
        <section className="relative w-full py-24 md:py-32 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Trusted by <span className="text-primary">Early Adopters</span>.
                    </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
                    {testimonials.map((t, i) => (
                        <Panel key={i} className="p-8 flex flex-col justify-between">
                            <div className="flex gap-1 mb-4">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                                ))}
                            </div>
                            <blockquote className="text-lg text-muted-foreground mb-6">
                                "{t.quote}"
                            </blockquote>
                            <div>
                                <div className="font-semibold text-foreground">{t.author}</div>
                                <div className="text-sm text-muted-foreground/60">{t.role}</div>
                            </div>
                        </Panel>
                    ))}
                </div>
            </div>
        </section>
    );
}
