"use client";

import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export interface PreChatData {
    ageRange: string;
    context: string;
    mainConcern: string;
}

interface PreChatFormProps {
    onSubmit: (data: PreChatData) => void;
}

export function PreChatForm({ onSubmit }: PreChatFormProps) {
    const [data, setData] = useState<PreChatData>({
        ageRange: "",
        context: "",
        mainConcern: ""
    });

    const isComplete = data.ageRange && data.context && data.mainConcern;

    return (
        <div className="max-w-md mx-auto mt-12">
            <Panel className="p-8 border-border shadow-sm">
                <div className="mb-6 space-y-2">
                    <h2 className="text-lg font-bold font-mono uppercase tracking-wider">Patient Intake</h2>
                    <p className="text-sm text-muted-foreground">Contextual variables required for risk stratification.</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-mono uppercase text-muted-foreground">Age Cohort</Label>
                        <Select onValueChange={(v) => setData({ ...data, ageRange: v })}>
                            <SelectTrigger className="font-mono text-sm">
                                <SelectValue placeholder="Select cohort" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="13-17">Adolescent (13-17)</SelectItem>
                                <SelectItem value="18-24">Young Adult (18-24)</SelectItem>
                                <SelectItem value="25-34">Adult (25-34)</SelectItem>
                                <SelectItem value="35+">Adult (35+)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-mono uppercase text-muted-foreground">Setting</Label>
                        <Select onValueChange={(v) => setData({ ...data, context: v })}>
                            <SelectTrigger className="font-mono text-sm">
                                <SelectValue placeholder="Select setting" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="school">K-12 Education</SelectItem>
                                <SelectItem value="university">University/College</SelectItem>
                                <SelectItem value="work">Corporate/Enterprise</SelectItem>
                                <SelectItem value="clinical">Clinical Referral</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-mono uppercase text-muted-foreground">Primary Complaint</Label>
                        <Input
                            placeholder="e.g. Anxiety, Insomnia..."
                            className="font-mono text-sm"
                            onChange={(e) => setData({ ...data, mainConcern: e.target.value })}
                        />
                    </div>

                    <Button
                        className="w-full font-mono uppercase tracking-widest mt-4"
                        onClick={() => isComplete && onSubmit(data)}
                        disabled={!isComplete}
                    >
                        Initialize_Session
                    </Button>
                </div>
            </Panel>
            <div className="mt-4 text-center text-[10px] text-muted-foreground font-mono">
                SESSION_SECURE • NO PHI STORED IN DEMO MODE
            </div>
        </div>
    );
}
