"use client";

import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Save, RotateCcw, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ActionsPage() {
    const [riskThresholdLow, setRiskThresholdLow] = useState(30);
    const [riskThresholdHigh, setRiskThresholdHigh] = useState(60);
    const [autoEscalate, setAutoEscalate] = useState(true);

    // Mock action logs
    const actionLogs = [
        { id: 1, action: "Risk threshold updated", user: "Dr. Smith", timestamp: "2024-11-30 14:22", details: "High risk threshold set to 65" },
        { id: 2, action: "Auto-escalation enabled", user: "Dr. Jones", timestamp: "2024-11-29 09:15", details: "Enabled automatic clinician alerts" },
        { id: 3, action: "Triage rules modified", user: "Dr. Smith", timestamp: "2024-11-28 16:45", details: "Updated PHQ-9 weighting" },
    ];

    return (
        <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Triage Configuration</h2>
                    <p className="text-muted-foreground">
                        Manage triage agent settings and view action history.
                    </p>
                </div>

                {/* Risk Thresholds */}
                <Panel className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Risk Score Thresholds</h3>

                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <Label>Low → Moderate Threshold</Label>
                                <span className="text-sm font-mono text-muted-foreground">{riskThresholdLow}/100</span>
                            </div>
                            <Slider
                                value={[riskThresholdLow]}
                                onValueChange={(value: number[]) => setRiskThresholdLow(value[0])}
                                max={100}
                                step={1}
                                className="w-full"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                Scores below {riskThresholdLow} are classified as Low Risk
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <Label>Moderate → High Threshold</Label>
                                <span className="text-sm font-mono text-muted-foreground">{riskThresholdHigh}/100</span>
                            </div>
                            <Slider
                                value={[riskThresholdHigh]}
                                onValueChange={(value: number[]) => setRiskThresholdHigh(value[0])}
                                max={100}
                                step={1}
                                className="w-full"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                Scores above {riskThresholdHigh} are classified as High Risk
                            </p>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label>Auto-Escalation</Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Automatically alert clinicians for high-risk patients
                                    </p>
                                </div>
                                <Button
                                    variant={autoEscalate ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setAutoEscalate(!autoEscalate)}
                                >
                                    {autoEscalate ? "Enabled" : "Disabled"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
                        <Button>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                        <Button variant="outline">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset to Defaults
                        </Button>
                    </div>
                </Panel>

                {/* Action History */}
                <Panel className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Action History</h3>
                    </div>

                    <div className="space-y-3">
                        {actionLogs.map((log) => (
                            <div key={log.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-medium">{log.action}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {log.user}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{log.details}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                        {log.timestamp}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>
    );
}
