"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Panel } from "@/components/ui/panel";
import { Shield, AlertTriangle, Lock, Activity, Heart, CheckCircle, XCircle } from "lucide-react";
import { CRISIS_RESOURCES } from "@/constants/crisis-resources";
import { siteConfig } from "@/lib/site-config";

export default function SafetyPage() {
    return (
        <MainLayout>
            <div className="space-y-12">
                {/* Hero Section */}
                <section className="section-spacing border-b border-border text-center">
                    <div className="max-w-4xl mx-auto space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-border text-muted-foreground text-xs uppercase tracking-wide">
                            <Shield className="h-4 w-4" />
                            Safety & Ethics
                        </div>
                        <h1>Our commitment to safety.</h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            MindBridge is designed with clinical responsibility and patient safety at its core. We are transparent about what we do, what we don&apos;t do, and the safeguards we have in place.
                        </p>
                    </div>
                </section>

                {/* What MindBridge Is */}
                <section className="section-spacing border-b border-border">
                    <div className="max-w-4xl mx-auto">
                        <Panel className="p-8">
                            <div className="flex items-start gap-4 mb-6">
                                <CheckCircle className="h-6 w-6 text-emerald-500 shrink-0 mt-1" />
                                <div>
                                    <h2 className="text-2xl font-bold mb-4">What MindBridge Is</h2>
                                    <ul className="space-y-3 text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-500 mt-1">•</span>
                                            <span><strong className="text-foreground">An assistive triage tool</strong> that helps clinicians prioritize patients based on risk assessment</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-500 mt-1">•</span>
                                            <span><strong className="text-foreground">A structured intake system</strong> using validated instruments (PHQ-9, GAD-7)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-500 mt-1">•</span>
                                            <span><strong className="text-foreground">A support for clinicians</strong> to reduce administrative burden and improve clinical efficiency</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-emerald-500 mt-1">•</span>
                                            <span><strong className="text-foreground">Human-in-the-loop</strong> — All high-risk cases are reviewed by licensed clinicians</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Panel>

                        <Panel className="p-8 mt-6 bg-destructive/5 border-destructive/20">
                            <div className="flex items-start gap-4">
                                <XCircle className="h-6 w-6 text-rose-500 shrink-0 mt-1" />
                                <div>
                                    <h2 className="text-2xl font-bold mb-4 text-rose-500">What MindBridge Is NOT</h2>
                                    <ul className="space-y-3 text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <span className="text-rose-500 mt-1">•</span>
                                            <span><strong className="text-rose-400">Not a diagnostic tool</strong> — We do not diagnose mental health conditions. Only licensed clinicians can diagnose.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-rose-500 mt-1">•</span>
                                            <span><strong className="text-rose-400">Not a crisis service</strong> — If you are in immediate danger, call emergency services (911/000) or a crisis line.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-rose-500 mt-1">•</span>
                                            <span><strong className="text-rose-400">Not a replacement for clinical judgment</strong> — AI assists, but humans decide treatment.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-rose-500 mt-1">•</span>
                                            <span><strong className="text-rose-400">Not therapy or treatment</strong> — We collect information; we don&apos;t provide ongoing therapeutic care.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Panel>
                    </div>
                </section>

                {/* AI Limitations */}
                <section className="section-spacing border-b border-border">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold mb-3">Known limitations of AI</h2>
                            <p className="text-muted-foreground">
                                We are transparent about the limitations and risks of AI in healthcare.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <Panel className="p-6">
                                <AlertTriangle className="h-8 w-8 text-amber-500 mb-4" />
                                <h3 className="font-semibold mb-2">Hallucination Risk</h3>
                                <p className="text-sm text-muted-foreground">
                                    AI can generate plausible-sounding but incorrect information. All outputs are reviewed by clinicians before clinical action.
                                </p>
                            </Panel>

                            <Panel className="p-6">
                                <AlertTriangle className="h-8 w-8 text-amber-500 mb-4" />
                                <h3 className="font-semibold mb-2">Bias & Fairness</h3>
                                <p className="text-sm text-muted-foreground">
                                    AI models can reflect biases in training data. We continuously monitor for demographic disparities in risk stratification.
                                </p>
                            </Panel>

                            <Panel className="p-6">
                                <AlertTriangle className="h-8 w-8 text-amber-500 mb-4" />
                                <h3 className="font-semibold mb-2">Context Limitations</h3>
                                <p className="text-sm text-muted-foreground">
                                    AI lacks full clinical context (patient history, physical exam, cultural nuances). This is why human review is mandatory.
                                </p>
                            </Panel>

                            <Panel className="p-6">
                                <AlertTriangle className="h-8 w-8 text-amber-500 mb-4" />
                                <h3 className="font-semibold mb-2">Not a Black Box</h3>
                                <p className="text-sm text-muted-foreground">
                                    We provide clinicians with the reasoning behind risk scores, key factors identified, and source data for transparency.
                                </p>
                            </Panel>
                        </div>
                    </div>
                </section>

                {/* Safety Measures */}
                <section className="section-spacing border-b border-border">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Safety Measures We Take</h2>
                        </div>

                        <div className="space-y-6">
                            <Panel className="p-6">
                                <div className="flex items-start gap-4">
                                    <Shield className="h-6 w-6 text-primary shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-2">Clinical Guardrails</h3>
                                        <p className="text-sm text-muted-foreground">
                                            AI is programmed to never diagnose, never guarantee safety, and always escalate high-risk cases to human clinicians immediately.
                                        </p>
                                    </div>
                                </div>
                            </Panel>

                            <Panel className="p-6">
                                <div className="flex items-start gap-4">
                                    <Activity className="h-6 w-6 text-primary shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-2">Continuous Monitoring</h3>
                                        <p className="text-sm text-muted-foreground">
                                            We monitor all sessions for safety events, log critical incidents, and conduct regular audits of risk stratification accuracy.
                                        </p>
                                    </div>
                                </div>
                            </Panel>

                            <Panel className="p-6">
                                <div className="flex items-start gap-4">
                                    <Lock className="h-6 w-6 text-primary shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-2">Privacy & Security</h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            We are committed to HIPAA (US) and Australian Privacy Act compliance:
                                        </p>
                                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                            <li>• End-to-end encryption of patient data</li>
                                            <li>• PHI redaction in logs and analytics</li>
                                            <li>• Minimum necessary data collection</li>
                                            <li>• Regular security audits and penetration testing</li>
                                        </ul>
                                    </div>
                                </div>
                            </Panel>

                            <Panel className="p-6">
                                <div className="flex items-start gap-4">
                                    <Heart className="h-6 w-6 text-primary shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold mb-2">Validated Instruments</h3>
                                        <p className="text-sm text-muted-foreground">
                                            We use evidence-based, clinically validated assessment tools (PHQ-9 for depression, GAD-7 for anxiety) rather than relying solely on AI interpretation.
                                        </p>
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    </div>
                </section>

                {/* Crisis Resources */}
                <section className="section-spacing border-y border-rose-200 bg-rose-50/40">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold mb-4">Crisis Resources</h2>
                            <p className="text-lg font-semibold text-rose-500">
                                If you are in immediate danger or thinking of harming yourself, contact emergency services or your local crisis line immediately.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                            <Panel className="p-6">
                                <h3 className="font-semibold mb-3">United States</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <div className="text-muted-foreground">988 Suicide & Crisis Lifeline</div>
                                        <div className="font-mono text-lg text-rose-400">988</div>
                                    </div>
                                    <div className="text-muted-foreground text-xs">
                                        Available 24/7 • Call or Text
                                    </div>
                                </div>
                            </Panel>

                            <Panel className="p-6">
                                <h3 className="font-semibold mb-3">Australia</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <div className="text-muted-foreground">Lifeline</div>
                                        <div className="font-mono text-lg text-rose-400">13 11 14</div>
                                    </div>
                                    <div className="text-muted-foreground text-xs">
                                        Available 24/7 • Call or Text
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        <div className="text-center mt-6 text-sm text-muted-foreground">
                            <p>Emergency: 911 (US) or 000 (Australia)</p>
                        </div>
                    </div>
                </section>

                {/* Contact */}
                <section className="section-spacing">
                    <div className="max-w-2xl mx-auto text-center space-y-3">
                        <h2 className="text-2xl font-bold">Questions about safety?</h2>
                        <p className="text-muted-foreground">
                            We are committed to transparency. If you have concerns about safety, privacy, or ethics,
                            please reach out to our clinical team.
                        </p>
                        <div className="text-sm text-muted-foreground">
                            <p>
                                Email:{" "}
                                <a
                                    href={`mailto:${siteConfig.contactEmails.support}`}
                                    className="text-primary hover:underline"
                                >
                                    {siteConfig.contactEmails.support}
                                </a>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
