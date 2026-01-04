import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

interface GlassSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
    asChild?: boolean;
}

export const GlassSurface = React.forwardRef<HTMLDivElement, GlassSurfaceProps>(
    ({ asChild = false, className, ...props }, ref) => {
        const Comp = asChild ? Slot : "div";

        return (
            <Comp
                ref={ref}
                className={cn(
                    "relative border border-border/60 bg-background/90 shadow-sm transition-all duration-200",
                    "supports-[backdrop-filter]:bg-background/75 supports-[backdrop-filter]:backdrop-blur-xl",
                    "supports-[backdrop-filter]:shadow-lg",
                    "hover:border-foreground/20 hover:shadow-md",
                    "focus-within:ring-1 focus-within:ring-ring/40",
                    className
                )}
                {...props}
            />
        );
    }
);

GlassSurface.displayName = "GlassSurface";
