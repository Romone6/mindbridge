"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerChildren } from "@/lib/motion";

const faqs = [
  {
    question: "How is this different from a standard symptom checker?",
    answer: "Standard symptom checkers are often rigid, decision-tree based tools that can feel impersonal and miss nuance. MindBridge uses a conversational AI to build rapport, ask follow-up questions dynamically, and assess risk based on the quality and content of the conversation, not just checkbox answers. It mimics a triage nurse interview rather than a form.",
  },
  {
    question: "Is MindBridge a medical device?",
    answer: "MindBridge is currently a Clinical Decision Support (CDS) tool designed to assist, not replace, human clinicians. It provides information to help prioritize cases but does not provide a definitive diagnosis or treatment plan. We are working towards regulatory clearance as Software as a Medical Device (SaMD) in relevant jurisdictions.",
  },
  {
    question: "What happens if the AI gets it wrong?",
    answer: "Safety is our top priority. We employ a \"fail-safe\" approach: if the system detects any ambiguity or high-risk keywords, it defaults to a higher risk category to ensure the patient is seen by a human. Furthermore, all AI-generated summaries and risk scores are presented to the clinician for verification—the human is always the final decision-maker.",
  },
  {
    question: "Where is patient data stored?",
    answer: "Data is stored in secure, SOC 2 compliant cloud infrastructure with strict geographic residency controls. All data is encrypted at rest and in transit. We maintain strict compliance with HIPAA, GDPR, and other relevant privacy regulations.",
  },
  {
    question: "Can I customize the triage protocols?",
    answer: "Yes. MindBridge is designed to be configurable. We can adjust the risk thresholds, escalation pathways, and specific questions asked during triage to align with your practice's specific clinical governance frameworks.",
  },
  {
    question: "Does it integrate with my EHR/PMS?",
    answer: "We are actively building integrations for major Electronic Health Records (EHR) and Practice Management Systems (PMS). Our API-first architecture allows for custom integrations where needed to ensure seamless workflow adoption.",
  },
];

/**
 * Animated FAQ Component
 * 
 * Features:
 * - Spring-based open/close animations using Framer Motion
 * - Staggered entrance for list items
 * - Animated icon transition (Plus -> Minus)
 * - Accessible focus states and keyboard navigation
 * 
 * @example
 * ```tsx
 * <AnimatedFAQ />
 * ```
 */
export function AnimatedFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren(0.1)}
          className="space-y-4"
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about MindBridge&apos;s clinical utility and safety.
            </p>
          </motion.div>

          <div className="grid gap-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
  return (
    <motion.div 
      variants={fadeUp}
      className={cn(
        "border rounded-xl overflow-hidden transition-all duration-300",
        isOpen ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30"
      )}
    >
      <button
        onClick={onClick}
        className="flex items-center justify-between w-full p-6 text-left"
        aria-expanded={isOpen}
      >
        <span className={cn("text-lg font-medium", isOpen && "text-primary")}>
          {question}
        </span>
        <div className={cn(
          "relative flex items-center justify-center w-6 h-6 transition-colors duration-300",
          isOpen ? "text-primary" : "text-muted-foreground"
        )}>
          <motion.span
            initial={false}
            animate={{ rotate: isOpen ? 180 : 0, opacity: isOpen ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <Plus className="w-5 h-5" />
          </motion.span>
          <motion.span
            initial={false}
            animate={{ rotate: isOpen ? 0 : -180, opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <Minus className="w-5 h-5" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
