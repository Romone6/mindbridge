"use client";

import { Panel } from "@/components/ui/panel";

export function TestimonialsSection() {
    return (
        <section className="section-spacing border-b border-border">
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h2>Testimonials</h2>
                    <p className="text-muted-foreground">
                        No published testimonials yet. Case studies will appear here once available.
                    </p>
                </div>

                <Panel className="p-6 text-center text-sm text-muted-foreground">
                    No testimonials yet.
                </Panel>
            </div>
        </section>
    );
}
