import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQPage() {
    return (
        <MainLayout>
            <div className="max-w-3xl space-y-8">
                <Link href="/clinicians">
                    <Button variant="ghost" size="sm" className="mb-8 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clinicians
                    </Button>
                </Link>

                <div className="space-y-3 text-center">
                    <h1>Clinician FAQ</h1>
                    <p className="text-lg text-muted-foreground">
                        Common questions about MindBridge&apos;s clinical utility, safety, and implementation.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-left">How is this different from a standard symptom checker?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            Standard symptom checkers are often rigid, decision-tree based tools that can feel impersonal and miss nuance. MindBridge uses a conversational AI to build rapport, ask follow-up questions dynamically, and assess risk based on the <em>quality</em> and <em>content</em> of the conversation, not just checkbox answers. It mimics a triage nurse interview rather than a form.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                        <AccordionTrigger className="text-left">Is MindBridge a medical device?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            MindBridge is currently a <strong>Clinical Decision Support (CDS) tool</strong> designed to assist, not replace, human clinicians. It provides information to help prioritize cases but does not provide a definitive diagnosis or treatment plan. We are working towards regulatory clearance as Software as a Medical Device (SaMD) in relevant jurisdictions.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                        <AccordionTrigger className="text-left">What happens if the AI gets it wrong?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            Safety is our top priority. We employ a &quot;fail-safe&quot; approach: if the system detects any ambiguity or high-risk keywords, it defaults to a higher risk category to ensure the patient is seen by a human. Furthermore, all AI-generated summaries and risk scores are presented to the clinician for verification—the human is always the final decision-maker.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4">
                        <AccordionTrigger className="text-left">Where is patient data stored?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            Data is stored in secure, SOC 2 compliant cloud infrastructure with strict geographic residency controls (e.g., data for Australian patients stays in Australia). All data is encrypted at rest and in transit. See our <Link href="/security" className="text-primary hover:underline">Security Page</Link> for more details.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5">
                        <AccordionTrigger className="text-left">Can I customize the triage protocols?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            Yes. MindBridge is designed to be configurable. We can adjust the risk thresholds, escalation pathways, and specific questions asked during triage to align with your practice&apos;s specific clinical governance frameworks.
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-6">
                        <AccordionTrigger className="text-left">Does it integrate with my EHR/PMS?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            We are actively building integrations for major Electronic Health Records (EHR) and Practice Management Systems (PMS) like Best Practice, MedicalDirector, and others. Our API-first architecture allows for custom integrations where needed.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="rounded-[var(--radius)] border border-border bg-muted/30 p-8 text-center space-y-3">
                    <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-semibold">Still have questions?</h3>
                    <p className="text-muted-foreground">
                        Our clinical team is happy to discuss your specific needs and concerns.
                    </p>
                    <Link href="/clinicians">
                        <Button>Contact Us</Button>
                    </Link>
                </div>
            </div>
        </MainLayout>
    );
}
