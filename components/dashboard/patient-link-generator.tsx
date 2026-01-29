"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Link, Clock } from "lucide-react";
import { useClinic } from "@/components/providers/clinic-provider";
import { toast } from "sonner";

export function PatientLinkGenerator() {
    const { currentClinic } = useClinic();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [expiresIn, setExpiresIn] = useState("24"); // hours

    const generateLink = async () => {
        if (!currentClinic) return;

        setIsGenerating(true);
        try {
            const response = await fetch('/api/patient-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clinicId: currentClinic.id,
                    expiresIn: expiresIn || null,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to generate link");

            setGeneratedLink(data.link);
            toast.success("Patient link generated successfully");
        } catch (error) {
            console.error("Failed to generate link:", error);
            toast.error("Failed to generate patient link");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async () => {
        if (!generatedLink) return;
        try {
            await navigator.clipboard.writeText(generatedLink);
            toast.success("Link copied to clipboard");
        } catch {
            toast.error("Failed to copy link");
        }
    };

    return (
        <Panel className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
                <Link className="h-4 w-4 text-muted-foreground" />
                Patient intake link
            </div>
            <p className="text-xs text-muted-foreground">
                Generate a time-limited link for patient intake submissions.
            </p>
            <div className="space-y-2">
                <Label htmlFor="expires" className="text-xs">Expires in (hours)</Label>
                <Input
                    id="expires"
                    type="number"
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                    placeholder="24"
                    min="1"
                />
                <p className="text-xs text-muted-foreground">
                    Leave empty for no expiration.
                </p>
            </div>

            <Button
                onClick={generateLink}
                disabled={isGenerating || !currentClinic}
                className="w-full"
            >
                {isGenerating ? "Generating..." : "Generate link"}
            </Button>

            {generatedLink && (
                <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription className="space-y-2">
                        <p className="font-medium">Patient link generated</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs bg-muted p-2 rounded break-all">
                                {generatedLink}
                            </code>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyToClipboard}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Share this link with patients to start their intake.
                        </p>
                    </AlertDescription>
                </Alert>
            )}
        </Panel>
    );
}
