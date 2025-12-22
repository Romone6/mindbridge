"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <MainLayout showFooter={false}>
            <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
                <div className="rounded-full bg-destructive/10 p-4 mb-4">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                    Clinical Interface Error
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    The triage session encountered a critical error. Patient data has been preserved safely.
                </p>
                <div className="flex gap-4">
                    <Button onClick={() => reset()} variant="default">
                        Restart Session
                    </Button>
                    <Button onClick={() => window.location.href = "/"} variant="outline">
                        Return to Reception
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
}
