import { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-muted/10 flex items-center justify-center p-4">
             {children}
        </div>
    );
}
