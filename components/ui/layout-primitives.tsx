import { cn } from "@/lib/utils";

/**
 * A standard layout container that enforces max-width and margins.
 * Replaces ad-hoc "container mx-auto" usage.
 */
export function Container({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

/**
 * A grid layout for instrument-panel style dashboards.
 * Enforces rigid spacing.
 */
export function InstrumentGrid({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
