"use client";

import { Button } from "@/components/ui/button";
import { Calendar, Mail } from "lucide-react";

export function DemoBooking() {
    return (
        <section className="section-spacing border-y border-border text-center">
            <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Schedule a demo
                </div>
                <h2>See MindBridge in action.</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Book a product walkthrough with our team. We will align on your intake workflow and configuration needs.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button
                        size="lg"
                        className="gap-2"
                        onClick={() => window.open('https://calendly.com/romonedunlop2/30min', '_blank')}
                    >
                        <Calendar className="h-5 w-5" />
                        Book a demo
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.location.href = 'mailto:sales@mindbridge.health'}
                    >
                        <Mail className="h-5 w-5" />
                        Contact sales
                    </Button>
                </div>
            </div>
        </section>
    );
}
