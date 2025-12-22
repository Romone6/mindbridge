
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Panel } from "@/components/ui/panel";
import { toast } from "sonner";
import { CheckCircle2, Terminal } from "lucide-react";

export function ClinicianInterestForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        organisation: "",
        email: "",
        goal: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/clinicians/interest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to submit");

            setIsSuccess(true);
            toast.success("Interest registered successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <Panel className="w-full max-w-lg mx-auto bg-emerald-500/5 border-emerald-500/20 p-12 text-center space-y-6">
                <div className="h-12 w-12 rounded bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">Registration Logged</h3>
                    <p className="text-muted-foreground text-sm">
                        Our team will review your application and contact you within 24 hours.
                    </p>
                </div>
                <Button variant="outline" onClick={() => setIsSuccess(false)} className="w-full">
                    Reset Form
                </Button>
            </Panel>
        );
    }

    return (
        <Panel id="interest-form" className="w-full max-w-lg mx-auto p-0 overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-background border border-border flex items-center justify-center text-muted-foreground">
                    <Terminal className="h-4 w-4" />
                </div>
                <div>
                    <h3 className="font-semibold text-sm">Application Interface</h3>
                    <p className="text-xs text-muted-foreground font-mono">SECURE_TRANSMISSION</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-card">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-mono uppercase text-muted-foreground">Full Name</Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Dr. Jane Smith"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="bg-muted/10"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-xs font-mono uppercase text-muted-foreground">Role</Label>
                        <Input
                            id="role"
                            name="role"
                            placeholder="GP / Psych"
                            required
                            value={formData.role}
                            onChange={handleChange}
                            className="bg-muted/10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="organisation" className="text-xs font-mono uppercase text-muted-foreground">Organisation</Label>
                        <Input
                            id="organisation"
                            name="organisation"
                            placeholder="Practice Name"
                            required
                            value={formData.organisation}
                            onChange={handleChange}
                            className="bg-muted/10"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-mono uppercase text-muted-foreground">Work Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="jane@clinic.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="bg-muted/10"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="goal" className="text-xs font-mono uppercase text-muted-foreground">Clinical Requirements</Label>
                    <Textarea
                        id="goal"
                        name="goal"
                        placeholder="Describe your current triage workflow..."
                        className="min-h-[100px] resize-none bg-muted/10"
                        value={formData.goal}
                        onChange={handleChange}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Transmitting..." : "Submit Application"}
                </Button>
            </form>
        </Panel>
    );
}
