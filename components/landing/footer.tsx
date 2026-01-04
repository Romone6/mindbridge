import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
    return (
        <footer className="w-full border-t border-border bg-background py-10 text-sm text-muted-foreground">
            <div className="page-container space-y-6">
                <div className="flex flex-wrap items-center justify-center gap-6">
                    <Link href="/pricing" className="hover:text-primary transition-colors">
                        Pricing
                    </Link>
                    <Link href="/methodology" className="hover:text-primary transition-colors">
                        Methodology
                    </Link>
                    <Link href="/trust" className="hover:text-primary transition-colors">
                        Trust
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
                    <Link href="/pitchdeck.pdf" className="hover:text-primary transition-colors">
                        Pitch deck (PDF)
                    </Link>
                </div>

                <div className="mx-auto max-w-2xl text-xs text-muted-foreground/70 text-center space-y-3">
                    <p className="mb-2">
                        <strong>Disclaimer:</strong> MindBridge is an AI-powered support tool, not a substitute for professional medical advice, diagnosis, or treatment.
                        In the event of a medical emergency, please call 911 or your local emergency services immediately.
                    </p>
                    <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground/80">
                        <span>{siteConfig.companyName}</span>
                        <div className="flex items-center gap-4">
                            <a
                                href="https://www.linkedin.com/company/mindbridge-health-technologies"
                                className="hover:text-primary transition-colors"
                            >
                                LinkedIn
                            </a>
                            <a
                                href="https://x.com/mindbridgehealth"
                                className="hover:text-primary transition-colors"
                            >
                                X
                            </a>
                        </div>
                    </div>
                    <p>
                        &copy; {siteConfig.copyrightYear} {siteConfig.companyName}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
