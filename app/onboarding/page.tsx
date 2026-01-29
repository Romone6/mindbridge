"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClinic } from "@/components/providers/clinic-provider";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { FormField, useFormValidation } from "@/lib/forms";

const validationRules = {
    clinicName: (value: string) => {
        if (!value.trim()) return "Clinic name is required";
        if (value.trim().length < 2) return "Clinic name must be at least 2 characters";
        return null;
    },
};

export default function OnboardingPage() {
    const { data: session } = authClient.useSession();
    const router = useRouter();
    const { refreshClinics } = useClinic();
    const [isLoading, setIsLoading] = useState(false);

    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleSubmit,
    } = useFormValidation(
        {
            clinicName: "",
            clinicAddress: "",
        },
        validationRules
    );

    const handleCreateClinic = async () => {
        setIsLoading(true);
        try {
            if (!session?.user) throw new Error("Authentication failed. Please sign in again.");

            const response = await fetch('/api/clinics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: values.clinicName,
                    address: values.clinicAddress,
                    timezone: 'Australia/Sydney',
                }),
            });

            if (!response.ok) {
                const body = await response.json();
                throw new Error(body.error || "Failed to create clinic");
            }

            await refreshClinics();
            toast.success("Clinic created successfully!");
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Failed to create clinic";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Create Your Clinic Workspace</CardTitle>
                <CardDescription>
                    MindBridge is designed for clinic-grade usage. Set up your organization to get started.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(handleCreateClinic); }} className="space-y-4">
                    <FormField
                        label="Clinic Name"
                        name="clinicName"
                        value={values.clinicName}
                        onChange={handleChange}
                        placeholder="e.g. Sydney Wellness Centre"
                        required
                        error={touched.clinicName ? errors.clinicName : undefined}
                    />
                    <FormField
                        label="Address (Optional)"
                        name="clinicAddress"
                        value={values.clinicAddress}
                        onChange={handleChange}
                        placeholder="123 George St, Sydney"
                    />
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || isSubmitting || !values.clinicName}
                    >
                        {isLoading || isSubmitting ? "Setting up..." : "Create Clinic & Continue"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
