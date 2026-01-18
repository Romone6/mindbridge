"use client";

import { useState, useEffect, useCallback } from "react";

export interface TourStep {
    step: number;
    title: string;
    target: string;
    description: string;
    icon: string;
}

export const TOUR_STEPS: TourStep[] = [
    { step: 1, title: "Welcome to MindBridge", target: "[data-tour='hero']", description: "Get started with an overview of the platform", icon: "Rocket" },
    { step: 2, title: "Account Setup", target: "[data-tour='settings']", description: "Configure your account settings and clinic profile", icon: "Settings" },
    { step: 3, title: "Intake Flow", target: "[data-tour='intake']", description: "Navigate through the patient intake workflow", icon: "ArrowRight" },
    { step: 4, title: "Review Queue", target: "[data-tour='patients']", description: "Monitor pending risk assessments and clinician assignments", icon: "Activity" },
    { step: 5, title: "Analytics", target: "[data-tour='analytics']", description: "View performance metrics and compliance reports", icon: "BarChart" },
];

const TOUR_STORAGE_KEY = "onboarding_tour_state";
const TOUR_STEP_KEY = "onboarding_current_step";

export interface TourState {
    currentStep: number;
    isTourCompleted: boolean;
    lastViewedPage: string | null;
    skippedSteps: number[];
}

export function getTourState(): TourState {
    if (typeof window === "undefined") {
        return {
            currentStep: 1,
            isTourCompleted: false,
            lastViewedPage: null,
            skippedSteps: [],
        };
    }

    const stored = localStorage.getItem(TOUR_STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return {
                currentStep: 1,
                isTourCompleted: false,
                lastViewedPage: null,
                skippedSteps: [],
            };
        }
    }

    return {
        currentStep: 1,
        isTourCompleted: false,
        lastViewedPage: null,
        skippedSteps: [],
    };
}

export function setTourState(state: TourState): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(state));
}

export function setTourStep(step: number): void {
    const state = getTourState();
    state.currentStep = step;
    state.isTourCompleted = step > TOUR_STEPS.length;
    state.lastViewedPage = window.location.pathname;
    setTourState(state);
    localStorage.setItem(TOUR_STEP_KEY, step.toString());
}

export function getTourStep(): number {
    if (typeof window === "undefined") return 1;
    const step = localStorage.getItem(TOUR_STEP_KEY);
    return step ? parseInt(step, 10) : 1;
}

export function resetTour(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOUR_STEP_KEY);
    localStorage.removeItem(TOUR_STORAGE_KEY);
}

export function isTourCompleted(): boolean {
    const state = getTourState();
    return state.isTourCompleted;
}

export function useTour() {
    const [isTourActive, setIsTourActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isReducedMotion] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        const state = getTourState();
        const step = getTourStep();
        setCurrentStep(step);
        setIsTourActive(!state.isTourCompleted && step <= TOUR_STEPS.length);
    }, []);

    const startTour = useCallback(() => {
        setTourStep(1);
        setIsTourActive(true);
    }, []);

    const skipTour = useCallback(() => {
        const state = getTourState();
        state.isTourCompleted = true;
        state.skippedSteps.push(currentStep);
        setTourState(state);
        setIsTourActive(false);
    }, [currentStep]);

    const nextStep = useCallback(() => {
        const next = currentStep + 1;
        if (next > TOUR_STEPS.length) {
            const state = getTourState();
            state.isTourCompleted = true;
            setTourState(state);
            setIsTourActive(false);
        } else {
            setTourStep(next);
            setCurrentStep(next);
        }
    }, [currentStep]);

    const prevStep = useCallback(() => {
        if (currentStep > 1) {
            const prev = currentStep - 1;
            setTourStep(prev);
            setCurrentStep(prev);
        }
    }, [currentStep]);

    const goToStep = useCallback((step: number) => {
        if (step >= 1 && step <= TOUR_STEPS.length) {
            setTourStep(step);
            setCurrentStep(step);
        }
    }, []);

    return {
        isTourActive,
        currentStep,
        totalSteps: TOUR_STEPS.length,
        currentTourStep: TOUR_STEPS[currentStep - 1],
        isReducedMotion,
        startTour,
        skipTour,
        nextStep,
        prevStep,
        goToStep,
        resetTour,
    };
}
