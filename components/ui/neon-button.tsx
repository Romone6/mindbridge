"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "@/components/ui/button";

type ButtonProps = React.ComponentProps<typeof Button>;

interface NeonButtonProps extends ButtonProps {
    glowColor?: string;
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
    ({ className, variant = "default", glowColor = "var(--primary)", ...props }, ref) => {
        return (
            <Button
                ref={ref}
                className={cn(
                    "relative transition-all duration-300",
                    "hover:shadow-[0_0_20px_var(--primary)] hover:-translate-y-0.5",
                    // Default glow for primary variant
                    variant === "default" && "shadow-[0_0_10px_var(--primary)] border-primary/50",
                    className
                )}
                variant={variant}
                {...props}
            />
        );
    }
);
NeonButton.displayName = "NeonButton";
