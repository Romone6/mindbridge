"use client";

import { Panel } from "@/components/ui/panel";
import { AlertOctagon, Phone } from "lucide-react";

export function CrisisBanner() {
    return (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 animate-in fade-in duration-300">
            <Panel className="max-w-4xl mx-auto bg-destructive/10 border-destructive/50 backdrop-blur-xl pointer-events-auto shadow-none">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 animate-pulse">
                            <AlertOctagon className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                            <h3 className="font-bold text-destructive text-lg">Crisis Detected</h3>
                            <p className="text-sm text-foreground/80">
                                This patient&apos;s risk score indicates immediate danger.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <a
                            href="tel:988"
                            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-6 rounded-md font-medium text-sm transition-colors"
                        >
                            <Phone className="h-4 w-4" />
                            Contact 988
                        </a>
                    </div>
                </div>
            </Panel>
        </div>
    );
}
