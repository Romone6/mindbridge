"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClinic } from "@/components/providers/clinic-provider";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
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
    const { user } = useUser();
    const { getToken } = useAuth();
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
            const token = await getToken({ template: 'supabase' });
            if (!token) throw new Error("Authentication failed. Please sign in again.");

            const supabase = createClerkSupabaseClient(token);
            if (!supabase) throw new Error("Database connection failed");

            const { data: clinic, error: clinicError } = await supabase
                .from('clinics')
                .insert({
                    name: values.clinicName,
                    address: values.clinicAddress,
                    timezone: 'Australia/Sydney'
                })
                .select()
                .single();

            if (clinicError) throw clinicError;

            const { error: memberError } = await supabase
                .from('clinic_memberships')
                .insert({
                    clinic_id: clinic.id,
                    user_id: user?.id,
                    role: 'OWNER'
                });

            if (memberError) {
                console.error("Failed to add membership", memberError);
                throw new Error("Failed to join created clinic");
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
