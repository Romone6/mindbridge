import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full py-8 border-t border-white/10 bg-background text-center text-sm text-muted-foreground">
            <div className="container mx-auto px-4 space-y-4">
                <div className="flex flex-wrap justify-center gap-6">
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
                    <Link href="/dashboard" className="hover:text-primary transition-colors font-semibold text-foreground/80">
                        Dashboard Login
                    </Link>
                </div>

                <div className="max-w-2xl mx-auto text-xs text-muted-foreground/60">
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
