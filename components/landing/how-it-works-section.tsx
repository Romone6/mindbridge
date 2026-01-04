"use client";

import { useEffect, useRef, useState } from "react";
import { ClipboardList, BrainCircuit, Stethoscope } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  title: string;
  description: string;
  icon: typeof ClipboardList;
  highlight: string;
  details: string[];
};

const steps: Step[] = [
  {
    id: "patient-intake",
    title: "Patient intake",
    description: "Patients complete a guided intake that captures symptoms, goals, and safety flags.",
    icon: ClipboardList,
    highlight: "Structured intake",
    details: [
      "Validated screenings (PHQ-9, GAD-7)",
      "Contextual notes and consent capture",
      "Immediate safety guidance",
    ],
  },
  {
    id: "ai-structuring",
    title: "AI structuring",
    description: "Responses are summarized into a clinician-ready view with risk cues and key themes.",
    icon: BrainCircuit,
    highlight: "AI summary",
    details: [
      "Risk factors surfaced with rationale",
      "Key themes grouped for review",
      "Actionable triage summary",
    ],
  },
  {
    id: "clinician-review",
    title: "Clinician review & escalation",
    description: "Clinicians review, confirm, and route the next step with full audit visibility.",
    icon: Stethoscope,
    highlight: "Clinician workflow",
    details: [
      "Priority queue with escalation triggers",
      "Human confirmation before action",
      "Audit trail for compliance",
    ],
  },
];

export function HowItWorksSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const elements = stepRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          const index = Number(visible[0].target.getAttribute("data-step"));
          if (!Number.isNaN(index)) {
            setActiveIndex(index);
          }
        }
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.2, 0.4, 0.6] }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <section id="how-it-works" className="section-spacing border-b border-border">
      <div className="space-y-8">
        <div className="max-w-2xl space-y-2">
          <Badge variant="outline" className="text-[11px] uppercase tracking-wide text-muted-foreground">
            How it works
          </Badge>
          <h2>From intake to clinician action in three steps.</h2>
          <p className="text-muted-foreground">
            Each stage is designed to reduce intake friction while keeping clinical oversight front and center.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ol className="space-y-6" aria-label="How it works steps">
            {steps.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={step.id}>
                  <div
                    ref={(element) => {
                      stepRefs.current[index] = element;
                    }}
                    data-step={index}
                    className={cn(
                      "rounded-[var(--radius)] border border-border bg-card p-5 transition-colors",
                      "focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2",
                      prefersReducedMotion
                        ? ""
                        : isActive
                        ? "border-primary/60 bg-primary/5"
                        : "opacity-80"
                    )}
                    tabIndex={0}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground">
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {prefersReducedMotion ? (
                          <div className="mt-4 space-y-2">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {step.highlight}
                            </div>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {step.details.map((detail) => (
                                <li key={detail} className="flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {!prefersReducedMotion ? (
            <div className="hidden lg:block">
              <div className="sticky top-28">
                <Panel className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {steps[activeIndex].highlight}
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Step {activeIndex + 1} of {steps.length}
                    </Badge>
                  </div>
                  <div className="text-base font-semibold">{steps[activeIndex].title}</div>
                  <p className="text-sm text-muted-foreground">
                    {steps[activeIndex].description}
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {steps[activeIndex].details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              </div>
            </div>
          ) : null}

          {!prefersReducedMotion ? (
            <div className="lg:hidden">
              <Panel className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {steps[activeIndex].highlight}
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Step {activeIndex + 1} of {steps.length}
                  </Badge>
                </div>
                <div className="text-base font-semibold">{steps[activeIndex].title}</div>
                <p className="text-sm text-muted-foreground">
                  {steps[activeIndex].description}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {steps[activeIndex].details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
