"use client";

export function NarrativeSection() {
    return (
        <section className="w-full border-b border-border py-24 bg-secondary/30">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                    <h2 className="text-xl font-semibold mb-6 text-primary">A better way to intake</h2>
                    <p className="text-3xl md:text-5xl leading-tight font-bold text-foreground mb-10 text-balance">
                        Care shouldn't have a waiting room.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-lg text-muted-foreground leading-relaxed">
                        <p>
                            MindBridge isn't just another tool. It's an extension of your clinical team, designed to listen and understand patient needs well before the first session.
                        </p>
                        <p>
                            By automating the heavy lifting of triage, we help clinics reduce wait times by up to 90%. Patients feel heard instantly, and clinicians get the clarity they need to provide life-saving care.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
