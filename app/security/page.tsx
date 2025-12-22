import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Lock, FileCheck, Eye } from "lucide-react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";

export default function SecurityPage() {
    return (
        <MainLayout>
            <div className="container mx-auto px-4 md:px-6 max-w-4xl py-16">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-8 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Button>
                </Link>

                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Security & Compliance</h1>
                    <p className="text-xl text-muted-foreground">
                        We are building MindBridge with a &quot;Security First&quot; approach, designing our systems to align with HIPAA and SOC 2 principles from day one.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <Shield className="h-8 w-8 text-emerald-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">HIPAA Alignment</h3>
                        <p className="text-muted-foreground">
                            We are designing our infrastructure and policies to meet the strict requirements of the Health Insurance Portability and Accountability Act (HIPAA), ensuring the confidentiality, integrity, and availability of PHI.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <FileCheck className="h-8 w-8 text-blue-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">SOC 2 Principles</h3>
                        <p className="text-muted-foreground">
                            Our security controls are mapped to SOC 2 Trust Services Criteria: Security, Availability, Processing Integrity, Confidentiality, and Privacy.
                        </p>
                    </div>
                </div>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Lock className="h-6 w-6 text-primary" />
                            Technical Safeguards
                        </h2>
                        <div className="grid gap-4">
                            <div className="flex gap-4 items-start">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                <div>
                                    <h4 className="font-medium">Encryption Everywhere</h4>
                                    <p className="text-sm text-muted-foreground">All data is encrypted in transit using TLS 1.2+ and at rest using AES-256 encryption.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                <div>
                                    <h4 className="font-medium">Role-Based Access Control (RBAC)</h4>
                                    <p className="text-sm text-muted-foreground">Strict permission policies ensure users only access data necessary for their role.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                <div>
                                    <h4 className="font-medium">Audit Logging</h4>
                                    <p className="text-sm text-muted-foreground">Comprehensive logging of all system access and data modifications for security monitoring.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Eye className="h-6 w-6 text-primary" />
                            AI Safety & Privacy
                        </h2>
                        <div className="grid gap-4">
                            <div className="flex gap-4 items-start">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                <div>
                                    <h4 className="font-medium">No Training on PHI</h4>
                                    <p className="text-sm text-muted-foreground">Your patient data is NOT used to train our foundational AI models. We use zero-retention APIs where applicable.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                <div>
                                    <h4 className="font-medium">Data Minimization</h4>
                                    <p className="text-sm text-muted-foreground">We only collect and process the minimum amount of data required to perform triage and risk assessment.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </MainLayout>
    );
}
