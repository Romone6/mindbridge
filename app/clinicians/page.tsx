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
            <ClinicianHero />
            <ClinicianValueProps />
            <ClinicianScreenshots />
            <ClinicianHowItWorks />
            <DemoBooking />
            <section className="section-spacing border-b border-border">
                <div className="space-y-4 text-center">
                    <h2>Partner with MindBridge.</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Register your interest and we will follow up with integration details and clinical requirements.
                    </p>
                </div>
                <div className="pt-6">
                    <ClinicianInterestForm />
                </div>
            </section>
            <TrustSection />
        </MainLayout>
    );
}
