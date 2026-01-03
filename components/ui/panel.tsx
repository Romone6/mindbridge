import { cn } from "@/lib/utils";
import React from "react";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "subtle" | "ghost";
}

/**
 * Clinical OS Panel
 * A solid, trustworthy container with precise borders and no "glass" effects.
 * Replaces: GlassCard
 */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
    ({ className, variant = "default", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "bg-card text-card-foreground border border-border rounded-[var(--radius)]",
                    "surface-card",
                    variant === "subtle" && "bg-muted/40 border-border",
                    variant === "ghost" && "bg-transparent border-none shadow-none",
                    className
                )}
                {...props}
            />
        );
    }
);
Panel.displayName = "Panel";
