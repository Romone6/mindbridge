"use client";

import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import { FormField, SelectField, useFormValidation } from "@/lib/forms";

export interface PreChatData {
    ageRange: string;
    context: string;
    mainConcern: string;
}

interface PreChatFormProps {
    onSubmit: (data: PreChatData) => void;
}

const validationRules = {
    mainConcern: (value: string) => {
        if (!value.trim()) return "Primary complaint is required";
        if (value.trim().length < 3) return "Please describe your concern in at least 3 characters";
        return null;
    },
};

export function PreChatForm({ onSubmit }: PreChatFormProps) {
    const {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
    } = useFormValidation(
        {
            ageRange: "",
            context: "",
            mainConcern: "",
        },
        validationRules
    );

    const handleFormSubmit = async () => {
        if (values.ageRange && values.context && values.mainConcern) {
            onSubmit({
                ageRange: values.ageRange,
                context: values.context,
                mainConcern: values.mainConcern,
            });
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12">
            <Panel className="p-8 border-border shadow-sm">
                <div className="mb-6 space-y-2">
                    <h2 className="text-lg font-bold font-mono uppercase tracking-wider">Patient Intake</h2>
                    <p className="text-sm text-muted-foreground">Contextual variables required for risk stratification.</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSubmit(handleFormSubmit); }} className="space-y-6">
                    <SelectField
                        label="Age Cohort"
                        name="ageRange"
                        value={values.ageRange}
                        onChange={handleChange}
                        placeholder="Select cohort"
                        required
                        error={touched.ageRange ? errors.ageRange : undefined}
                    >
                        <SelectItem value="13-17">Adolescent (13-17)</SelectItem>
                        <SelectItem value="18-24">Young Adult (18-24)</SelectItem>
                        <SelectItem value="25-34">Adult (25-34)</SelectItem>
                        <SelectItem value="35+">Adult (35+)</SelectItem>
                    </SelectField>

                    <SelectField
                        label="Setting"
                        name="context"
                        value={values.context}
                        onChange={handleChange}
                        placeholder="Select setting"
                        required
                        error={touched.context ? errors.context : undefined}
                    >
                        <SelectItem value="school">K-12 Education</SelectItem>
                        <SelectItem value="university">University/College</SelectItem>
                        <SelectItem value="work">Corporate/Enterprise</SelectItem>
                        <SelectItem value="clinical">Clinical Referral</SelectItem>
                    </SelectField>

                    <FormField
                        label="Primary Complaint"
                        name="mainConcern"
                        value={values.mainConcern}
                        onChange={handleChange}
                        placeholder="e.g. Anxiety, Insomnia..."
                        required
                        error={touched.mainConcern ? errors.mainConcern : undefined}
                        onBlur={() => handleBlur("mainConcern")}
                    />

                    <Button
                        type="submit"
                        className="w-full font-mono uppercase tracking-widest mt-4"
                        disabled={isSubmitting || !values.ageRange || !values.context || !values.mainConcern}
                    >
                        {isSubmitting ? "Processing..." : "Initialize_Session"}
                    </Button>
                </form>
            </Panel>
            <div className="mt-4 text-center text-[10px] text-muted-foreground font-mono">
                SESSION_SECURE • NO PHI STORED IN DEMO MODE
            </div>
        </div>
    );
}
