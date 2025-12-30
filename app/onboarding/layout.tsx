import { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-muted/10 flex items-center justify-center p-4 pt-20">
                 {children}
            </div>
        </>
    );
}
