"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const session = searchParams.get("session_id");
        if (session) {
            setSessionId(session);
        }
    }, [searchParams]);

    const handlePortal = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/create-portal-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
            });

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error("Portal error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <GlassCard className="max-w-2xl w-full p-12 text-center space-y-8">
                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                    </div>
                </div>

                {/* Success Message */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold">Welcome to MindBridge!</h1>
                    <p className="text-muted-foreground text-lg">
                        Your subscription is now active. Thank you for joining us on this journey to better mental health.
                    </p>
                </div>

                {/* What's Next */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-left space-y-4">
                    <h3 className="font-semibold text-lg">What&apos;s Next?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>You&apos;ll receive a confirmation email with your receipt</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Access your dashboard to start using MindBridge</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>Manage your subscription anytime through the billing portal</span>
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="gap-2">
                        <Link href="/dashboard">
                            Go to Dashboard
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>

                    {sessionId && (
                        <Button
                            variant="outline"
                            size="lg"
                            className="gap-2"
                            onClick={handlePortal}
                            disabled={loading}
                        >
                            <Settings className="h-4 w-4" />
                            {loading ? "Loading..." : "Manage Billing"}
                        </Button>
                    )}
                </div>

                {/* Help Section */}
                <p className="text-xs text-muted-foreground">
                    Need help? Contact us at{" "}
                    <a href="mailto:support@mindbridge.ai" className="text-primary hover:underline">
                        support@mindbridge.ai
                    </a>
                </p>
            </GlassCard>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    );
}

