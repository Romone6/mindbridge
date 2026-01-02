"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClinic } from "@/components/providers/clinic-provider";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

export default function OnboardingPage() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const { refreshClinics } = useClinic();
    const [isLoading, setIsLoading] = useState(false);
    
    // Form State
    const [clinicName, setClinicName] = useState("");
    const [clinicAddress, setClinicAddress] = useState("");

    const handleCreateClinic = async () => {
        setIsLoading(true);
        try {
            const token = await getToken({ template: 'supabase' });
            if (!token) throw new Error("Authentication failed. Please sign in again.");
            
            const supabase = createClerkSupabaseClient(token);
            if (!supabase) throw new Error("Database connection failed");

            // 1. Create Clinic
            const { data: clinic, error: clinicError } = await supabase
                .from('clinics')
                .insert({
                    name: clinicName,
                    address: clinicAddress,
                    timezone: 'Australia/Sydney' // Default for pilot
                })
                .select()
                .single();

            if (clinicError) throw clinicError;

            // 2. Add Membership (Owner)
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

            // 3. Refresh Context and Redirect
            await refreshClinics();
            toast.success("Clinic created successfully!");
            router.push('/dashboard');
        } catch (error: unknown) {
            console.error(error);
            if (error instanceof Error) {
                toast.error(error.message || "Failed to create clinic");
            } else {
                toast.error("Failed to create clinic");
            }
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
                <div className="space-y-2">
                    <Label htmlFor="clinicName">Clinic Name</Label>
                    <Input 
                        id="clinicName" 
                        placeholder="e.g. Sydney Wellness Centre" 
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <Input 
                        id="address" 
                        placeholder="123 George St, Sydney" 
                        value={clinicAddress}
                        onChange={(e) => setClinicAddress(e.target.value)}
                    />
                </div>
                <Button 
                    className="w-full" 
                    onClick={handleCreateClinic} 
                    disabled={isLoading || !clinicName}
                >
                    {isLoading ? "Setting up..." : "Create Clinic & Continue"}
                </Button>
            </CardContent>
        </Card>
    );
}
