"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Mail } from "lucide-react";

export function DemoBooking() {
    return (
        <div className="w-full bg-gradient-to-br from-primary/10 via-primary/5 to-background border-y border-primary/10 py-24">
            <div className="container mx-auto px-4 text-center max-w-4xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary backdrop-blur-sm mb-6">
                    <Calendar className="h-4 w-4" />
                    Book a Demo
                </div>
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    See MindBridge in Action
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
                    Book a personalized 20-minute product walk-through with our team.
                    We&apos;ll show you how MindBridge can integrate with your existing workflow and improve patient outcomes.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                        size="lg"
                        className="gap-2 h-12 px-8 text-base shadow-lg shadow-primary/20"
                        onClick={() => window.open('https://calendly.com/romonedunlop2/30min', '_blank')}
                    >
                        <Calendar className="h-5 w-5" />
                        Book a Demo
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="gap-2 h-12 px-8 text-base border-primary/20 hover:bg-primary/5"
                        onClick={() => window.location.href = 'mailto:sales@mindbridge.health'}
                    >
                        <Mail className="h-5 w-5" />
                        Contact Sales
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground/60 mt-6">
                    No commitment required - Flexible scheduling - Expert guidance
                </p>
            </div>
        </div>
    );
}
