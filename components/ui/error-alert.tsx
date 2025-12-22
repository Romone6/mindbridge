import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
    title?: string;
    message: string;
    className?: string;
}

export function ErrorAlert({ title = "Error", message, className }: ErrorAlertProps) {
    return (
        <Alert variant="destructive" className={cn("bg-destructive/10 border-destructive/20 text-destructive", className)}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                {message}
            </AlertDescription>
        </Alert>
    );
}
