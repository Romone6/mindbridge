"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { ClinicianHero } from "@/components/clinicians/clinician-hero";
import { ClinicianValueProps } from "@/components/clinicians/clinician-value-props";
import { ClinicianScreenshots } from "@/components/clinicians/clinician-screenshots";
import { ClinicianHowItWorks } from "@/components/clinicians/clinician-how-it-works";
import { ClinicianInterestForm } from "@/components/clinicians/interest-form";
import { DemoBooking } from "@/components/common/demo-booking";
import { TrustSection } from "@/components/landing/trust-section";

export default function CliniciansPage() {
    return (
        <MainLayout>
            <main className="flex min-h-screen flex-col items-center justify-between bg-background">
                <ClinicianHero />
                <ClinicianValueProps />
                <ClinicianScreenshots />
                <ClinicianHowItWorks />
                <DemoBooking />
                <div className="w-full max-w-4xl mx-auto px-4 py-24">
                    <h2 className="text-3xl font-bold text-center mb-4">Partner with MindBridge</h2>
                    <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                        Join our network of forward-thinking clinicians. Register your interest and we&apos;ll be in touch to discuss how MindBridge can integrate with your practice.
                    </p>
                    <ClinicianInterestForm />
                </div>
                <TrustSection />
            </main>
        </MainLayout>
    );
}
