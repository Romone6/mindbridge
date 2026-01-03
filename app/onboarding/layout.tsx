import { ReactNode } from "react";
import { PageShell } from "@/components/layout/page-shell";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
    return (
        <PageShell showFooter={false}>
            <div className="flex min-h-[60vh] items-center justify-center">
                {children}
            </div>
        </PageShell>
    );
}
