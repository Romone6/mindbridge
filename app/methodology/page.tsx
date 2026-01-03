import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, Activity, AlertTriangle, Globe } from "lucide-react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";

export default function MethodologyPage() {
    return (
        <MainLayout>
            <div className="max-w-4xl space-y-12">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-8 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Button>
                </Link>

                <div className="space-y-3">
                    <h1>Clinical methodology</h1>
                    <p className="text-lg text-muted-foreground">
                        Our approach combines advanced Large Language Models (LLMs) with established clinical frameworks to provide safe, consistent, and explainable triage support.
                    </p>
                </div>

                <div className="space-y-16">
                    {/* Hybrid Model */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Brain className="h-6 w-6 text-primary" />
                            Hybrid Intelligence Model
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            MindBridge does not rely solely on generative AI for decision-making. We use a hybrid architecture:
                        </p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-[var(--radius)] bg-card border border-border">
                                <h3 className="font-semibold mb-2">1. Generative Layer</h3>
                                <p className="text-sm text-muted-foreground">
                                    Uses LLMs to understand natural language, build rapport, and extract clinical entities (symptoms, duration, severity) from patient conversations.
                                </p>
                            </div>
                            <div className="p-6 rounded-[var(--radius)] bg-card border border-border">
                                <h3 className="font-semibold mb-2">2. Rules-Based Guardrails</h3>
                                <p className="text-sm text-muted-foreground">
                                    Deterministic clinical rules map extracted entities to risk bands. This ensures that critical keywords (e.g., &quot;suicide&quot;, &quot;overdose&quot;) trigger immediate escalation regardless of the LLM&apos;s output.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Risk Stratification */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Activity className="h-6 w-6 text-primary" />
                            Risk Stratification Framework
                        </h2>
                        <div className="overflow-hidden rounded-[var(--radius)] border border-border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/30 text-muted-foreground font-medium">
                                    <tr>
                                        <th className="p-4">Risk Band</th>
                                        <th className="p-4">Score</th>
                                        <th className="p-4">Definition</th>
                                        <th className="p-4">Typical Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    <tr>
                                        <td className="p-4"><span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-500 text-xs font-medium">Low</span></td>
                                        <td className="p-4">0 - 25</td>
                                        <td className="p-4">No immediate risk identified. General distress or mild symptoms.</td>
                                        <td className="p-4">Routine appointment booking. Self-help resources.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4"><span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-500 text-xs font-medium">Moderate</span></td>
                                        <td className="p-4">26 - 50</td>
                                        <td className="p-4">Significant distress, functional impairment, but no immediate safety risk.</td>
                                        <td className="p-4">Priority appointment based on clinic availability.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4"><span className="px-2 py-1 rounded bg-orange-500/20 text-orange-500 text-xs font-medium">High</span></td>
                                        <td className="p-4">51 - 75</td>
                                        <td className="p-4">Severe symptoms, potential safety concerns, or rapid deterioration.</td>
                                        <td className="p-4">Urgent review per clinical protocols. Crisis plan activation.</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4"><span className="px-2 py-1 rounded bg-red-500/20 text-red-500 text-xs font-medium">Crisis</span></td>
                                        <td className="p-4">76 - 100</td>
                                        <td className="p-4">Imminent risk of harm to self or others.</td>
                                        <td className="p-4">Immediate emergency services (000/911). Direct clinician alert.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Factors */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <AlertTriangle className="h-6 w-6 text-primary" />
                            Key Risk Factors
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            Our system continuously monitors the conversation for specific risk markers, including but not limited to:
                        </p>
                        <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground list-disc list-inside">
                            <li>Intensity of negative emotion (hopelessness, despair)</li>
                            <li>Presence of a specific plan or intent for self-harm</li>
                            <li>Access to means (medication, weapons)</li>
                            <li>History of past attempts</li>
                            <li>Lack of social support or protective factors</li>
                            <li>Substance use or intoxication</li>
                        </ul>
                    </section>

                    {/* Limitations */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Globe className="h-6 w-6 text-primary" />
                            Known Limitations
                        </h2>
                        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <span className="text-amber-500 font-bold">•</span>
                                    <span className="text-muted-foreground"><strong>Text-Only Analysis:</strong> The system cannot currently analyze tone of voice, body language, or silence, which are critical clinical cues.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-amber-500 font-bold">•</span>
                                    <span className="text-muted-foreground"><strong>Cultural Nuance:</strong> While we train on diverse datasets, idioms and cultural expressions of distress may occasionally be misinterpreted.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-amber-500 font-bold">•</span>
                                    <span className="text-muted-foreground"><strong>Complex Comorbidities:</strong> Highly complex cases with multiple overlapping physical and mental health conditions may require human review for accurate triage.</span>
                                </li>
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </MainLayout>
    );
}
