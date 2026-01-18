import { cn } from "@/lib/utils";
import React from "react";

interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Glass intensity - affects background opacity and blur strength
     * @default "medium"
     */
    intensity?: "subtle" | "medium" | "strong";
    /**
     * Whether to apply hover/focus elevation effects
     * @default false
     */
    interactive?: boolean;
}

/**
 * Glass Surface Component
 *
 * Provides a translucent glass-like surface with backdrop blur effects.
 * Includes progressive enhancement with fallbacks for unsupported browsers.
 *
 * - Uses backdrop-filter: blur() when supported
 * - Falls back to solid/semi-transparent backgrounds
 * - Maintains accessibility and contrast requirements
 * - Supports hover/focus states with subtle elevation
 */
export const GlassSurface = React.forwardRef<HTMLDivElement, GlassSurfaceProps>(
    ({ className, intensity = "medium", interactive = false, ...props }, ref) => {
        const baseClasses = [
            "relative",
            "supports-[backdrop-filter]:backdrop-blur",
            "supports-[backdrop-filter]:bg-background/80",
            "border border-border/50",
            "transition-all duration-200 ease-out",
        ];

        const intensityClasses = {
            subtle: [
                "supports-[backdrop-filter]:backdrop-blur-sm",
                "supports-[backdrop-filter]:bg-background/60",
                "bg-background/90",
            ],
            medium: [
                "supports-[backdrop-filter]:backdrop-blur-md",
                "supports-[backdrop-filter]:bg-background/75",
                "bg-background/95",
            ],
            strong: [
                "supports-[backdrop-filter]:backdrop-blur-lg",
                "supports-[backdrop-filter]:bg-background/85",
                "bg-background/98",
            ],
        };

        const interactiveClasses = interactive ? [
            "hover:border-border",
            "hover:shadow-sm",
            "focus-visible:border-border",
            "focus-visible:shadow-sm",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-ring/50",
        ] : [];

        return (
            <div
                ref={ref}
                className={cn(
                    baseClasses,
                    intensityClasses[intensity],
                    interactiveClasses,
                    className
                )}
                {...props}
            />
        );
    }
);

GlassSurface.displayName = "GlassSurface";
