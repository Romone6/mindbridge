"use client";

import { motion } from "framer-motion";
import { XCircle } from "lucide-react";

const notList = [
    "Not a diagnostic tool",
    "Not a crisis service",
    "Not a replacement for clinical judgement",
];

export function ClinicianNotList() {
    return (
        <section className="w-full py-12 bg-black/20 border-y border-white/5">
            <div className="container mx-auto px-4 md:px-6 text-center">
                <h3 className="text-lg font-semibold text-muted-foreground mb-8 uppercase tracking-widest">
                    What MindBridge is <span className="text-rose-400">NOT</span>
                </h3>
                <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16">
                    {notList.map((item, index) => (
                        <motion.div
                            key={item}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-center gap-3 text-lg font-medium"
                        >
                            <XCircle className="h-5 w-5 text-rose-500" />
                            <span>{item}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
