"use client";

import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { FormField, FormError, useFormValidation } from "@/lib/forms";

const validationRules = {
    email: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) return "Email is required";
        if (!emailRegex.test(value)) return "Please enter a valid email address";
        return null;
    },
};

export function WaitlistSection() {
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleSubmit,
    } = useFormValidation({ email: "" }, validationRules);

    const onSubmit = async () => {
        setSubmitError(null);

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: values.email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            toast.success(data.message);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Something went wrong";
            setSubmitError(message);
            toast.error(message);
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

                    {submitError && (
                        <div className="max-w-md mx-auto">
                            <FormError error={submitError} onRetry={() => setSubmitError(null)} />
                        </div>
                    )}

                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <FormField
                            label="Email"
                            name="email"
                            type="email"
                            value={values.email}
                            onChange={handleChange}
                            placeholder="Work email"
                            required
                            error={touched.email ? errors.email : undefined}
                            className="h-11"
                        />
                        <Button type="submit" size="lg" className="h-11 px-6" disabled={isSubmitting}>
                            {isSubmitting ? (
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
