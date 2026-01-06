"use client";

import { useEffect, useState } from "react";
import { useTour, TOUR_STEPS, getTourState } from "@/lib/onboarding";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";

interface OnboardingTourProps {
    onClose?: () => void;
}

export function OnboardingTour({ onClose }: OnboardingTourProps) {
    const {
        isTourActive,
        currentStep,
        totalSteps,
        currentTourStep,
        isReducedMotion,
        skipTour,
        nextStep,
        prevStep,
        goToStep,
    } = useTour();

    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (!isTourActive || !currentTourStep) return;

        const updateTargetRect = () => {
            const target = document.querySelector(currentTourStep.target);
            if (target) {
                setTargetRect(target.getBoundingClientRect());
            } else {
                setTargetRect(null);
            }
        };

        updateTargetRect();
        window.addEventListener("resize", updateTargetRect);
        window.addEventListener("scroll", updateTargetRect, true);

        return () => {
            window.removeEventListener("resize", updateTargetRect);
            window.removeEventListener("scroll", updateTargetRect, true);
        };
    }, [isTourActive, currentTourStep]);

    if (!isTourActive || !currentTourStep) return null;

    return (
        <div className="fixed inset-0 z-50" aria-hidden="true">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={skipTour} />
            
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
                <div className="bg-background rounded-lg shadow-lg border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                {TOUR_STEPS.map((step) => (
                                    <div
                                        key={step.step}
                                        className={`h-2 w-2 rounded-full transition-colors ${
                                            step.step === currentStep
                                                ? "bg-primary"
                                                : step.step < currentStep
                                                ? "bg-primary/50"
                                                : "bg-muted"
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {currentStep} of {totalSteps}
                            </span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={skipTour} aria-label="Skip tour">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-2 mb-6">
                        <h3 className="text-lg font-semibold">{currentTourStep.title}</h3>
                        <p className="text-sm text-muted-foreground">{currentTourStep.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStep === 1}>
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-1">
                            {TOUR_STEPS.map((step) => (
                                <button
                                    key={step.step}
                                    onClick={() => goToStep(step.step)}
                                    className={`h-2 w-2 rounded-full transition-all ${
                                        step.step === currentStep
                                            ? "bg-primary w-4"
                                            : "bg-muted hover:bg-muted/80"
                                    }`}
                                    aria-label={`Go to step ${step.step}`}
                                />
                            ))}
                        </div>

                        <Button size="sm" onClick={nextStep}>
                            {currentStep === totalSteps ? "Finish" : "Next"}
                            {currentStep < totalSteps && <ChevronRight className="h-4 w-4 ml-1" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface TourTriggerProps {
    variant?: "button" | "menu";
}

export function TourTrigger({ variant = "button" }: TourTriggerProps) {
    const { startTour, isTourActive } = useTour();
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const state = getTourState();
        setIsCompleted(state.isTourCompleted);
    }, []);

    if (isTourActive) return null;

    if (variant === "menu") {
        return (
            <button
                onClick={startTour}
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md hover:bg-muted"
            >
                <Play className="h-4 w-4" />
                <span>Start tour</span>
            </button>
        );
    }

    return (
        <Button variant="outline" size="sm" onClick={startTour} disabled={isCompleted}>
            <Play className="h-4 w-4 mr-1" />
            {isCompleted ? "Tour completed" : "Start tour"}
        </Button>
    );
}
