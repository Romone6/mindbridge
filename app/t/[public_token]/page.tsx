"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Loader2, Bot } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { submitIntake } from "@/app/actions/intake";
import { PageShell } from "@/components/layout/page-shell";
import { IntakeChat } from "@/components/intake/intake-chat";

export default function IntakePage() {
    const params = useParams();
    const token = params.public_token as string;
    const [step, setStep] = useState<'welcome' | 'chat' | 'success'>('welcome');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [clinicId, setClinicId] = useState<string | null>(null);
    const [chatStatus, setChatStatus] = useState({
        isComplete: false,
        analysis: "",
        riskScore: null as number | null
    });

    const wrap = (node: React.ReactNode) => (
        <PageShell showFooter={false}>
            <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
                <div className="w-full max-w-2xl">{node}</div>
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

    const handleFinalSubmit = async () => {
        if (!clinicId) return;
        setIsSubmitting(true);
        try {
            await submitIntake(clinicId, {
                complaint: "Conversational Intake Completed",
                aiAnalysis: chatStatus.analysis,
                riskScore: chatStatus.riskScore
            });
            setStep('success');
        } catch (err) {
            console.error(err);
            alert("Failed to finalize intake. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isValidating) {
        return wrap(
            <Card className="border-none shadow-lg">
                <CardContent className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-muted-foreground animate-pulse">Securing session...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (token && !isValidToken) {
        return wrap(
            <Card className="border-destructive/20 shadow-xl overflow-hidden">
                <CardHeader className="bg-destructive/5 pb-8 pt-10 text-center">
                    <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-destructive">Link Inactive</CardTitle>
                    <CardDescription className="text-base max-w-[300px] mx-auto pt-2">
                        This patient intake link is no longer valid or has expired.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 text-center bg-background">
                    <p className="text-muted-foreground mb-6">
                        For your privacy and security, intake links are time-sensitive. Please reach out to your clinical team to request a new secure link.
                    </p>
                    <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => window.location.href = "/"}>
                        Return home
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (step === 'welcome') {
        return wrap(
            <Card className="border-none shadow-2xl overflow-hidden rounded-3xl">
                <div className="h-2 bg-primary" />
                <CardHeader className="pt-10 pb-6 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">MindBridge Intake</CardTitle>
                    <CardDescription className="text-lg pt-2">
                        Your first step toward personalized care.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 px-8 pb-10">
                    <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 rounded-2xl py-4">
                        <AlertTriangle className="h-5 w-5 mt-0.5" />
                        <div className="ml-3">
                            <AlertTitle className="text-base font-bold">Emergency Warning</AlertTitle>
                            <AlertDescription className="text-sm opacity-90 leading-relaxed">
                                If you are in immediate danger or experiencing a medical emergency, please call **000** or your local emergency services immediately.
                            </AlertDescription>
                        </div>
                    </Alert>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-blue-50 p-2 rounded-lg mt-1">
                                <Bot className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Guided intake</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Our AI assistant will help you describe your needs through a brief, secure conversation.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-green-50 p-2 rounded-lg mt-1">
                                <AlertTriangle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">Clinical review</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    This is a preliminary assessment to help your clinician. It is not a formal diagnosis.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-primary/25 transition-all" onClick={() => setStep('chat')}>
                        Start secure intake
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (step === 'success') {
        return wrap(
            <Card className="border-none shadow-2xl overflow-hidden rounded-3xl text-center">
                <div className="h-2 bg-emerald-500" />
                <CardHeader className="pt-12 pb-4">
                    <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Loader2 className="h-10 w-10 text-emerald-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-emerald-600">Securely Recorded</CardTitle>
                    <CardDescription className="text-lg pt-2">
                        Your intake has been successfully submitted.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-12 space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                        Thank you for sharing. Your clinician at <strong>MindBridge</strong> has been notified and will review your clinical profile shortly.
                    </p>
                    <div className="pt-4">
                        <Button variant="outline" className="h-12 px-8 rounded-xl" onClick={() => window.location.href = "/"}>
                            Close secure session
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return wrap(
        <Card className="border-none shadow-2xl overflow-hidden rounded-3xl flex flex-col h-[700px]">
            <CardHeader className="border-b bg-muted/30 px-6 py-4 flex flex-row items-center justify-between shrink-0">
                <div className="space-y-1">
                    <CardTitle className="text-xl">Intake Conversation</CardTitle>
                    <CardDescription className="text-xs">Secure Clinical Assistant</CardDescription>
                </div>
                {chatStatus.isComplete && (
                    <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 animate-in fade-in slide-in-from-right-2"
                        onClick={handleFinalSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Finalizing..." : "Submit Intake"}
                    </Button>
                )}
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <IntakeChat
                    clinicId={clinicId!}
                    sessionId={token}
                    onComplete={(isComplete, analysis, score) => {
                        setChatStatus({ isComplete, analysis, riskScore: score });
                        // If AI marks as complete, we could auto-submit, but better to let user review
                    }}
                />
            </CardContent>
        </Card>
    );
}
