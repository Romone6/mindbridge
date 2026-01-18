import { LucideIcon } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    iconColor?: string;
    iconBgColor?: string;
    footer?: React.ReactNode;
    className?: string;
}

export function FeatureCard({
    title,
    description,
    icon: Icon,
    iconColor = "text-muted-foreground",
    iconBgColor = "bg-muted/50",
    footer,
    className,
}: FeatureCardProps) {
    return (
        <Panel className={cn("flex h-full flex-col gap-4 p-6", className)}>
            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", iconBgColor)}>
                <Icon className={cn("h-6 w-6", iconColor)} />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {footer && <div className="mt-auto">{footer}</div>}
        </Panel>
    );
}
