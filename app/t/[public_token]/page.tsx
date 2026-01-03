"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { submitIntake } from "@/app/actions/intake";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { PageShell } from "@/components/layout/page-shell";

export default function IntakePage() {
    const params = useParams();
    const token = params.public_token as string;
    const [step, setStep] = useState<'welcome' | 'form' | 'success'>('welcome');
    const [complaint, setComplaint] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [clinicId, setClinicId] = useState<string | null>(null);
    const { getToken } = useAuth();

    const wrap = (node: React.ReactNode) => (
        <PageShell showFooter={false}>
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-full max-w-xl">{node}</div>
            </div>
        </PageShell>
    );

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setIsValidating(false);
                setIsValidToken(false);
                return;
            }

            try {
                // For public access, we need to use service role or allow anon
                // Since RLS allows public read for valid links, we can use anon client
                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                const { data, error } = await supabase
                    .from('patient_links')
                    .select('clinic_id')
                    .eq('link_token', token)
                    .gt('expires_at', new Date().toISOString())
                    .single();

                if (error || !data) {
                    setIsValidToken(false);
                } else {
                    setIsValidToken(true);
                    setClinicId(data.clinic_id);
                }
            } catch (err) {
                console.error('Token validation error:', err);
                setIsValidToken(false);
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async () => {
        if (!complaint.trim() || !clinicId) return;
        setIsSubmitting(true);
        try {
            await submitIntake(clinicId, { complaint });
            setStep('success');
        } catch (err) {
            console.error(err);
            alert("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isValidating) {
        return wrap(
            <Card>
                <CardContent className="flex items-center justify-center h-40">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p>Validating link...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (token && !isValidToken) {
        return wrap(
            <Card>
                <CardHeader>
                    <CardTitle className="text-red-500">Invalid link</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Link expired or invalid</AlertTitle>
                        <AlertDescription>
                            This patient intake link is no longer valid. Please contact your clinic for a new link.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (step === 'welcome') {
        return wrap(
            <Card>
                <CardHeader>
                    <CardTitle>Welcome</CardTitle>
                    <CardDescription>
                        Before we begin, please note that this is an automated intake system.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Emergency warning</AlertTitle>
                        <AlertDescription>
                            If you are in immediate danger or experiencing a medical emergency, please call 000 immediately.
                        </AlertDescription>
                    </Alert>
                    <p className="text-sm text-muted-foreground">
                        This assessment will help triage your needs. It is not a diagnosis.
                    </p>
                    <Button className="w-full" onClick={() => setStep('form')}>
                        I understand, start assessment
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (step === 'success') {
         return wrap(
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-emerald-600">Submission received</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        Your intake has been securely recorded. A clinician will review it shortly.
                    </p>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Return to home
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return wrap(
        <Card>
            <CardHeader>
                <CardTitle>How can we help you today?</CardTitle>
                <CardDescription>
                    Please describe your current situation and what led you to seek help.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="complaint">Describe your main concern</Label>
                    <Textarea
                        id="complaint"
                        placeholder="I've been feeling..."
                        className="min-h-[150px]"
                        value={complaint}
                        onChange={(e) => setComplaint(e.target.value)}
                    />
                </div>
                <Button
                    className="w-full"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !complaint}
                >
                    {isSubmitting ? "Submitting..." : "Submit for triage"}
                </Button>
            </CardContent>
        </Card>
    );
}
