"use client";

import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Save, RotateCcw, Activity } from "lucide-react";

export default function ActionsPage() {
    const [riskThresholdLow, setRiskThresholdLow] = useState(30);
    const [riskThresholdHigh, setRiskThresholdHigh] = useState(60);
    const [autoEscalate, setAutoEscalate] = useState(true);

    return (
        <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Triage configuration</h2>
                    <p className="text-muted-foreground">
                        Manage triage agent settings and review configuration history.
                    </p>
                </div>

                {/* Risk Thresholds */}
                <Panel className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Risk score thresholds</h3>

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

                        <div className="pt-4 border-t border-border">
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

                    <div className="flex gap-3 mt-6 pt-6 border-t border-border">
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
                        <h3 className="text-lg font-semibold">Action history</h3>
                    </div>

                    <div className="rounded-[var(--radius)] border border-dashed border-border p-6 text-sm text-muted-foreground">
                        No configuration changes yet.
                    </div>
                </Panel>
            </div>
    );
}
