"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
    threshold?: number;
    rootMargin?: string;
}

export function ScrollReveal({
    className,
    threshold = 0.2,
    rootMargin = "0px 0px -10% 0px",
    ...props
}: ScrollRevealProps) {
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const element = ref.current;
        if (!element) {
            return;
        }

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) {
            element.dataset.reveal = "visible";
            return;
        }

        element.dataset.reveal = "hidden";

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }
                    (entry.target as HTMLElement).dataset.reveal = "visible";
                    observer.unobserve(entry.target);
                });
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin]);

    return (
        <div
            ref={ref}
            data-scroll-reveal=""
            data-reveal="hidden"
            className={cn(
                "motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out",
                "data-[reveal=hidden]:opacity-0 data-[reveal=hidden]:translate-y-4 data-[reveal=visible]:opacity-100 data-[reveal=visible]:translate-y-0",
                "motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none",
                className
            )}
            {...props}
        />
    );
}
