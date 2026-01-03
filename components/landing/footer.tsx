import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t border-border bg-background py-10 text-sm text-muted-foreground">
            <div className="page-container space-y-6">
                <div className="flex flex-wrap items-center justify-center gap-6">
                    <Link href="/methodology" className="hover:text-primary transition-colors">
                        Methodology
                    </Link>
                    <Link href="/security" className="hover:text-primary transition-colors">
                        Security
                    </Link>
                    <Link href="/safety" className="hover:text-primary transition-colors">
                        Safety & Ethics
                    </Link>
                    <Link href="/clinicians/faq" className="hover:text-primary transition-colors">
                        FAQ
                    </Link>
                    <Link href="/legal/terms" className="hover:text-primary transition-colors">
                        Terms of Service
                    </Link>
                    <Link href="/legal/privacy" className="hover:text-primary transition-colors">
                        Privacy Policy
                    </Link>
                </div>

                <div className="mx-auto max-w-2xl text-xs text-muted-foreground/70 text-center">
                    <p className="mb-2">
                        <strong>Disclaimer:</strong> MindBridge is an AI-powered support tool, not a substitute for professional medical advice, diagnosis, or treatment.
                        In the event of a medical emergency, please call 911 or your local emergency services immediately.
                    </p>
                    <p>&copy; {new Date().getFullYear()} MindBridge Health, Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
