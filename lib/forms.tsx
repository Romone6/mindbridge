"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface FormFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
    onBlur?: (name: string) => void;
    type?: "text" | "email" | "tel" | "number";
    placeholder?: string;
    required?: boolean;
    pattern?: string;
    error?: string;
    hint?: string;
    mask?: "phone" | "none";
    className?: string;
}

export function FormField({
    label,
    name,
    value,
    onChange,
    onBlur,
    type = "text",
    placeholder,
    required,
    pattern,
    error,
    hint,
    mask = "none",
    className,
}: FormFieldProps) {
    const [touched, setTouched] = useState(false);
    const [internalError, setInternalError] = useState("");

    const formatPhone = useCallback((input: string) => {
        const digits = input.replace(/\D/g, "");
        if (digits.length <= 4) return digits;
        if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
        return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value;

        if (mask === "phone") {
            const digits = e.target.value.replace(/\D/g, "");
            if (digits.length <= 12) {
                newValue = formatPhone(digits);
            } else {
                newValue = formatPhone(digits.slice(0, 12));
            }
        }

        onChange(name, newValue);

        if (touched && pattern) {
            const regex = new RegExp(pattern);
            if (newValue && !regex.test(newValue)) {
                setInternalError(`Please enter a valid ${label.toLowerCase()}`);
            } else {
                setInternalError("");
            }
        }
    };

    const handleBlur = () => {
        setTouched(true);
        if (required && !value) {
            setInternalError(`${label} is required`);
        } else if (pattern && value && !new RegExp(pattern).test(value)) {
            setInternalError(`Please enter a valid ${label.toLowerCase()}`);
        } else {
            setInternalError("");
        }
        onBlur?.(name);
    };

    const displayError = error || internalError;
    const showError = touched && displayError;

    return (
        <div className="space-y-2">
            <Label htmlFor={name}>
                {label}
                {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
            </Label>
            <Input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={showError ? "true" : undefined}
                aria-describedby={showError ? `${name}-error` : hint ? `${name}-hint` : undefined}
                aria-required={required}
                className={`${showError ? "border-destructive focus-visible:ring-destructive" : ""} ${className || ""}`}
            />
            {showError && (
                <p id={`${name}-error`} className="text-sm text-destructive flex items-center gap-1" role="alert">
                    <AlertCircle className="h-3 w-3" />
                    {displayError}
                </p>
            )}
            {!showError && hint && (
                <p id={`${name}-hint`} className="text-sm text-muted-foreground">
                    {hint}
                </p>
            )}
        </div>
    );
}

interface SelectFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (name: string, value: string) => void;
    onBlur?: (name: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}

export function SelectField({
    label,
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    required,
    error,
    children,
}: SelectFieldProps) {
    const showError = !!error;

    return (
        <div className="space-y-2">
            <Label htmlFor={name}>
                {label}
                {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
            </Label>
            <Select value={value} onValueChange={(v) => onChange(name, v)}>
                <SelectTrigger
                    id={name}
                    name={name}
                    className={showError ? "border-destructive focus-visible:ring-destructive" : ""}
                    onBlur={() => onBlur?.(name)}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {children}
                </SelectContent>
            </Select>
            {showError && (
                <p id={`${name}-error`} className="text-sm text-destructive flex items-center gap-1" role="alert">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}
        </div>
    );
}

interface FormSuccessProps {
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function FormSuccess({ title, message, actionLabel, onAction }: FormSuccessProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm">{message}</p>
            </div>
            {actionLabel && onAction && (
                <Button variant="outline" onClick={onAction} className="w-full">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}

interface FormErrorProps {
    error: string;
    onRetry?: () => void;
}

export function FormError({ error, onRetry }: FormErrorProps) {
    return (
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-3 border border-destructive/20 rounded-lg bg-destructive/5">
            <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{error}</span>
            </div>
            {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                    Try again
                </Button>
            )}
        </div>
    );
}

export function useFormValidation(
    initialState: Record<string, string>,
    rules: Partial<Record<string, (value: string) => string | null>>
) {
    const [values, setValues] = useState(initialState);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (name: string, value: string) => {
        setValues(prev => ({ ...prev, [name]: value }));
        if (touched[name] && rules[name]) {
            const error = rules[name]!(value);
            setErrors(prev => ({ ...prev, [name]: error || "" }));
        }
    };

    const handleBlur = (name: string) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        if (rules[name]) {
            const error = rules[name]!(values[name]);
            setErrors(prev => ({ ...prev, [name]: error || "" }));
        }
    };

    const validate = useCallback(() => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        for (const [key, rule] of Object.entries(rules)) {
            if (rule) {
                const error = rule(values[key]);
                if (error) {
                    newErrors[key] = error;
                    isValid = false;
                }
            }
        }

        setErrors(newErrors);
        setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<string, boolean>));
        return isValid;
    }, [values, rules]);

    const handleSubmit = async (onSubmit: (values: Record<string, string>) => Promise<void>) => {
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(values);
        } finally {
            setIsSubmitting(false);
        }
    };

    const reset = () => {
        setValues(initialState);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    };

    return {
        values,
        errors,
        touched,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        validate,
        reset,
    };
}
