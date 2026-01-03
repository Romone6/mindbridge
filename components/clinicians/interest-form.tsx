
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Panel } from "@/components/ui/panel";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

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
            <Panel className="w-full max-w-lg mx-auto p-10 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">Registration received</h3>
                    <p className="text-muted-foreground text-sm">
                        We will review your request and follow up with next steps.
                    </p>
                </div>
                <Button variant="outline" onClick={() => setIsSuccess(false)} className="w-full">
                    Submit another request
                </Button>
            </Panel>
        );
    }

    return (
        <Panel id="interest-form" className="w-full max-w-lg mx-auto p-6">
            <div className="space-y-1 mb-6">
                <h3 className="text-lg font-semibold">Partner interest form</h3>
                <p className="text-sm text-muted-foreground">Share the basics and we will follow up.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Dr. Jane Smith"
                        required
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input
                            id="role"
                            name="role"
                            placeholder="GP / Psych"
                            required
                            value={formData.role}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="organisation">Organisation</Label>
                        <Input
                            id="organisation"
                            name="organisation"
                            placeholder="Practice Name"
                            required
                            value={formData.organisation}
                            onChange={handleChange}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Work email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="jane@clinic.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="goal">Clinical requirements</Label>
                    <Textarea
                        id="goal"
                        name="goal"
                        placeholder="Describe your current triage workflow..."
                        className="min-h-[100px] resize-none"
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
