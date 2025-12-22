"use client";

import { Panel } from "@/components/ui/panel";
import { motion } from "framer-motion";

const screenshots = [
    {
        title: "Triage Chat",
        description: "AI-guided intake collecting history and symptoms.",
        mock: (
            <div className="flex flex-col gap-2 p-3 h-full text-[10px]">
                <div className="self-start bg-white/10 p-1.5 rounded-lg max-w-[70%]">
                    How long have you felt this way?
                </div>
                <div className="self-end bg-emerald-500/20 text-emerald-100 p-1.5 rounded-lg max-w-[70%]">
                    About 2 weeks. Getting worse.
                </div>
                <div className="self-start bg-white/10 p-1.5 rounded-lg max-w-[70%]">
                    Any changes in sleep?
                </div>
            </div>
        )
    },
    {
        title: "Risk Monitor",
        description: "Real-time risk estimation with reasoning.",
        mock: (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-4 w-full">
                <div className="flex items-end gap-0.5 h-12 w-full max-w-[140px] border-b border-white/10 pb-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className={`flex-1 rounded-sm ${i < 7 ? 'bg-amber-500' : 'bg-white/5'}`}
                            style={{ height: `${20 + (i * 5)}%` }}
                        />
                    ))}
                </div>
                <div className="text-center space-y-1">
                    <div className="text-lg font-mono font-bold text-amber-500 tracking-tight">MODERATE</div>
                    <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Score: 14/27</div>
                </div>
            </div>
        )
    },
    {
        title: "Clinician Dashboard",
        description: "Prioritised list of patients needing attention.",
        mock: (
            <div className="flex flex-col gap-2 p-3 h-full text-[9px]">
                <div className="flex justify-between items-center p-2 bg-rose-500/10 border border-rose-500/20 rounded">
                    <span className="font-medium">Sarah J.</span>
                    <span className="text-rose-400 font-bold text-[8px]">High Risk</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-500/10 border border-amber-500/20 rounded">
                    <span className="font-medium">Mike T.</span>
                    <span className="text-amber-400 font-bold text-[8px]">Moderate</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white/5 border border-white/10 rounded">
                    <span className="font-medium">Emma W.</span>
                    <span className="text-emerald-400 font-bold text-[8px]">Low Risk</span>
                </div>
            </div>
        )
    },
    {
        title: "Case Detail",
        description: "Comprehensive summary for quick review.",
        mock: (
            <div className="flex flex-col gap-2 p-3 h-full text-[9px]">
                <div className="font-bold border-b border-white/10 pb-1 text-[10px]">Summary</div>
                <p className="text-muted-foreground leading-relaxed">
                    Patient reports persistent low mood and insomnia. Denies SI. History of GAD.
                </p>
                <div className="font-bold border-b border-white/10 pb-1 mt-1 text-[10px]">Key Factors</div>
                <div className="flex gap-1 flex-wrap">
                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-[8px]">Insomnia</span>
                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-[8px]">Anxiety</span>
                </div>
            </div>
        )
    }
];

export function ClinicianScreenshots() {
    return (
        <section className="w-full py-24 bg-black/20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-3">
                        Platform Preview
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        A glimpse into the MindBridge clinical interface
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {screenshots.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Panel className="overflow-hidden h-[320px] flex flex-col border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:border-primary/20">
                                <div className="h-[200px] bg-black/50 border-b border-white/10 relative">
                                    {item.mock}
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-semibold mb-1.5 text-sm">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                                </div>
                            </Panel>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
