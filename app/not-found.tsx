"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
    return (
        <MainLayout showFooter={false}>
            <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
                <div className="rounded-full bg-muted p-4 mb-4">
                    <FileQuestion className="h-12 w-12 text-muted-foreground" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-2">
                    Page Not Found
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-md">
                    The clinical resource you are looking for does not exist or has been moved.
                </p>
                <Button asChild size="lg">
                    <Link href="/">Return to Reception</Link>
                </Button>
            </div>
        </MainLayout>
    );
}
