"use client";

import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function WaitlistSection() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            toast.success(data.message);
            setEmail("");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Something went wrong";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="waitlist" className="relative w-full py-24 md:py-32 bg-background overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="container relative mx-auto px-4 md:px-6">
                <Panel className="max-w-3xl mx-auto text-center p-12 md:p-16 border-primary/20 bg-background/50">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                            Ready to Bridge the Gap?
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                            Join the waitlist today and get early access to the future of mental healthcare.
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mt-8">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground/50"
                            />
                            <Button size="lg" className="h-12 px-8" disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Join Now <ArrowRight className="ml-2 h-4 w-4" /></>}
                            </Button>
                        </form>

                        <p className="text-xs text-muted-foreground mt-4">
                            By joining, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </motion.div>
                </Panel>
            </div>
        </section>
    );
}
