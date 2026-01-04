"use client";

import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

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
        <section id="waitlist" className="section-spacing border-b border-border">
            <Panel className="p-8 md:p-10 text-center max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <h2>Join the MindBridge waitlist.</h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Request early access for your clinic. We will follow up with onboarding and pricing details.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <Input
                            type="email"
                            placeholder="Work email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-11"
                        />
                        <Button size="lg" className="h-11 px-6" disabled={loading}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    Join waitlist <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="text-xs text-muted-foreground">
                        By joining, you agree to our{" "}
                        <Link href="/legal/terms" className="underline underline-offset-4 hover:text-foreground">
                            Terms
                        </Link>{" "}
                        and{" "}
                        <Link href="/legal/privacy" className="underline underline-offset-4 hover:text-foreground">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </motion.div>
            </Panel>
        </section>
    );
}
