"use client";

import { Panel } from "@/components/ui/panel";
import { motion } from "framer-motion";

const screenshots = [
    {
        title: "Intake transcript",
        description: "Guided intake flow with clinical prompts and patient responses.",
    },
    {
        title: "Risk review",
        description: "Clinician view of risk indicators and summary notes.",
    },
    {
        title: "Patient queue",
        description: "Prioritized list with status and escalation markers.",
    },
    {
        title: "Case detail",
        description: "Session summary, notes, and audit trail in one place.",
    },
];

export function ClinicianScreenshots() {
    return (
        <section className="section-spacing border-b border-border">
            <div className="space-y-6 text-center">
                <div className="space-y-2">
                    <h2>Workflow preview.</h2>
                    <p className="text-muted-foreground">
                        Preview tiles show interface modules. Data appears once a clinic is configured.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 text-left">
                    {screenshots.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Panel className="flex h-full flex-col gap-4 p-5">
                                <div className="flex h-24 items-center justify-center rounded-[var(--radius)] border border-dashed border-border text-xs text-muted-foreground">
                                    No data yet
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                            </Panel>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
