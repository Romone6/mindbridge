"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Panel } from "@/components/ui/panel";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { FormField, FormSuccess, FormError, useFormValidation } from "@/lib/forms";

const validationRules = {
    name: (value: string) => value.trim().length < 2 ? "Name must be at least 2 characters" : null,
    role: (value: string) => value.trim().length < 2 ? "Role must be at least 2 characters" : null,
    organisation: (value: string) => value.trim().length < 2 ? "Organisation must be at least 2 characters" : null,
    email: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) return "Email is required";
        if (!emailRegex.test(value)) return "Please enter a valid email address";
        return null;
    },
    goal: (value: string) => value.trim().length < 10 ? "Please describe your requirements in at least 10 characters" : null,
};

export function ClinicianInterestForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
    } = useFormValidation(
        {
            name: "",
            role: "",
            organisation: "",
            email: "",
            goal: "",
        },
        validationRules
    );

    const onSubmit = async (values: Record<string, string>) => {
        setIsLoading(true);
        setSubmitError(null);

        try {
            const res = await fetch('/api/clinicians/interest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                throw new Error("Failed to submit. Please try again.");
            }

            setIsSuccess(true);
            toast.success("Interest registered successfully!");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
            setSubmitError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <Panel className="w-full max-w-lg mx-auto p-10 text-center space-y-4">
                <FormSuccess
                    title="Registration received"
                    message="We will review your request and follow up with next steps."
                    actionLabel="Submit another request"
                    onAction={() => {
                        setIsSuccess(false);
                        reset();
                    }}
                />
            </Panel>
        );
    }

    return (
        <Panel id="interest-form" className="w-full max-w-lg mx-auto p-6">
            <div className="space-y-1 mb-6">
                <h3 className="text-lg font-semibold">Partner interest form</h3>
                <p className="text-sm text-muted-foreground">Share the basics and we will follow up.</p>
            </div>

            {submitError && (
                <div className="mb-6">
                    <FormError error={submitError} onRetry={() => setSubmitError(null)} />
                </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit); }} className="space-y-5">
                <FormField
                    label="Full name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Dr. Jane Smith"
                    required
                    error={touched.name ? errors.name : undefined}
                    onBlur={() => handleBlur("name")}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        label="Role"
                        name="role"
                        value={values.role}
                        onChange={handleChange}
                        placeholder="GP / Psych"
                        required
                        error={touched.role ? errors.role : undefined}
                        onBlur={() => handleBlur("role")}
                    />
                    <FormField
                        label="Organisation"
                        name="organisation"
                        value={values.organisation}
                        onChange={handleChange}
                        placeholder="Practice Name"
                        required
                        error={touched.organisation ? errors.organisation : undefined}
                        onBlur={() => handleBlur("organisation")}
                    />
                </div>

                <FormField
                    label="Work email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="jane@clinic.com"
                    required
                    error={touched.email ? errors.email : undefined}
                    onBlur={() => handleBlur("email")}
                    hint="We will use this to contact you about your application"
                />

                <div className="space-y-2">
                    <Label htmlFor="goal">
                        Clinical requirements
                        <span className="text-destructive ml-1" aria-hidden="true">*</span>
                    </Label>
                    <Textarea
                        id="goal"
                        name="goal"
                        placeholder="Describe your current triage workflow..."
                        className="min-h-[100px] resize-none"
                        value={values.goal}
                        onChange={(e) => handleChange("goal", e.target.value)}
                        onBlur={() => handleBlur("goal")}
                        aria-invalid={touched.goal && !!errors.goal}
                        aria-describedby={touched.goal && errors.goal ? "goal-error" : undefined}
                    />
                    {touched.goal && errors.goal && (
                        <p id="goal-error" className="text-sm text-destructive flex items-center gap-1" role="alert">
                            <AlertCircle className="h-3 w-3" />
                            {errors.goal}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
                    {isLoading || isSubmitting ? "Transmitting..." : "Submit Application"}
                </Button>
            </form>
        </Panel>
    );
}
