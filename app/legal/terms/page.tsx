import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background pt-20 pb-16">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-8 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Button>
                </Link>

                <article className="prose prose-invert prose-emerald max-w-none">
                    <h1>Terms of Service</h1>
                    <p className="lead text-xl text-muted-foreground">Last Updated: November 2025</p>

                    <h2>1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using the MindBridge platform ("Service"), you agree to be bound by these Terms of Service.
                        If you do not agree to these terms, please do not use the Service.
                    </p>

                    <h2>2. Medical Disclaimer (Critical)</h2>
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 not-prose my-6">
                        <strong>IMPORTANT:</strong> MindBridge is a clinical support tool, NOT a doctor.
                        The Service does not provide medical diagnoses or treatment.
                        <strong>In a medical emergency, call 911 or your local emergency number immediately.</strong>
                    </div>
                    <p>
                        The output provided by our AI agents is for informational and triage prioritization purposes only.
                        It is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
                    </p>

                    <h2>3. Data Privacy & HIPAA</h2>
                    <p>
                        We take your privacy seriously. Our handling of health information is governed by our Privacy Policy
                        and, where applicable, the Business Associate Agreement (BAA) signed with covered entities.
                        We utilize SOC2 Type II compliant infrastructure.
                    </p>

                    <h2>4. User Responsibilities</h2>
                    <p>
                        You agree not to misuse the Service or help anyone else do so. You are responsible for maintaining
                        the confidentiality of your account credentials.
                    </p>

                    <h2>5. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by law, MindBridge shall not be liable for any indirect, incidental,
                        special, consequential, or punitive damages, or any loss of profits or revenues.
                    </p>

                    <hr className="my-8 border-white/10" />

                    <p className="text-sm text-muted-foreground">
                        Contact: legal@mindbridge.ai
                    </p>
                </article>
            </div>
        </main>
    );
}
