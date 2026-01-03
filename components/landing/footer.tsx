import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t border-border/60 bg-background">
            <div className="mx-auto w-full max-w-6xl px-6 lg:px-10 py-10">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-wrap items-center justify-between gap-6 text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                        <span>MindBridge Health</span>
                        <div className="flex flex-wrap gap-6">
                            <Link href="/methodology" className="hover:text-foreground transition-colors">
                                Methodology
                            </Link>
                            <Link href="/security" className="hover:text-foreground transition-colors">
                                Security
                            </Link>
                            <Link href="/safety" className="hover:text-foreground transition-colors">
                                Safety
                            </Link>
                            <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
                                Privacy
                            </Link>
                            <Link href="/legal/terms" className="hover:text-foreground transition-colors">
                                Terms
                            </Link>
                        </div>
                    </div>

                    <div className="max-w-3xl text-xs text-muted-foreground">
                        <p>
                            MindBridge is an AI-powered support tool, not a substitute for professional medical advice, diagnosis, or treatment.
                            In the event of a medical emergency, please call 911 or your local emergency services immediately.
                        </p>
                    </div>
                    <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                        &copy; {new Date().getFullYear()} MindBridge Health, Inc.
                    </p>
                </div>
            </div>
        </footer>
    );
}
