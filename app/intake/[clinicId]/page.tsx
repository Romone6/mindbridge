"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { submitIntake } from "@/app/actions/intake";

export default function IntakePage() {
    const params = useParams();
    const clinicId = params.clinicId as string;
    const [step, setStep] = useState<'welcome' | 'form' | 'success'>('welcome');
    const [complaint, setComplaint] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!complaint.trim()) return;
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

    if (step === 'welcome') {
        return (
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
                        <AlertTitle>Emergency Warning</AlertTitle>
                        <AlertDescription>
                            If you are in immediate danger or experiencing a medical emergency, please call 000 immediately.
                        </AlertDescription>
                    </Alert>
                    <p className="text-sm text-muted-foreground">
                        This assessment will help triage your needs. It is not a diagnosis.
                    </p>
                    <Button className="w-full" onClick={() => setStep('form')}>
                        I Understand, Start Assessment
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (step === 'success') {
         return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-emerald-500">Submission Received</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                        Your intake has been securely recorded. A clinician will review it shortly.
                    </p>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Return to Home
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
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
                    {isSubmitting ? "Submitting..." : "Submit for Triage"}
                </Button>
            </CardContent>
        </Card>
    );
}
