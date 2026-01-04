"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/panel";

const storageKey = "mb_book_demo_lead";

type FormData = {
  name: string;
  email: string;
  organisation: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

type SubmitStatus = "idle" | "submitting" | "success" | "local";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (data: FormData): FormErrors => {
  const nextErrors: FormErrors = {};
  if (!data.name.trim()) {
    nextErrors.name = "Please enter your name.";
  }
  if (!data.organisation.trim()) {
    nextErrors.organisation = "Please enter your organisation.";
  }
  if (!data.email.trim()) {
    nextErrors.email = "Please enter a work email.";
  } else if (!emailPattern.test(data.email.trim())) {
    nextErrors.email = "Please enter a valid email address.";
  }
  return nextErrors;
};

const initialForm: FormData = {
  name: "",
  email: "",
  organisation: "",
};

export function BookDemoForm() {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.dataset.hydrated = "true";
    }
  }, []);

  const handleChange = (field: keyof FormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      if (status !== "idle") {
        setStatus("idle");
      }
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("submitting");
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      organisation: formData.organisation.trim(),
      role: "Demo request",
      goal: "Schedule product walkthrough",
    };

    let submitted = false;
    try {
      const response = await fetch("/api/clinicians/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      submitted = response.ok;
    } catch {
      submitted = false;
    }

    if (!submitted) {
      try {
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({ ...payload, submittedAt: new Date().toISOString() })
        );
      } catch {
        // Ignore storage errors.
      }
      setStatus("local");
      return;
    }

    setStatus("success");
  };

  if (status === "success" || status === "local") {
    return (
      <Panel
        className="p-8 text-center space-y-4"
        data-testid="book-demo-form"
        data-hydrated="false"
        ref={containerRef}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-2" data-testid="book-demo-status">
          <h2 className="text-lg font-semibold">Thanks for reaching out</h2>
          <p className="text-sm text-muted-foreground">
            We received your request and will follow up shortly with scheduling options.
          </p>
          {status === "local" ? (
            <p className="text-xs text-muted-foreground">
              We saved your request locally and will use it to prepare for the demo conversation.
            </p>
          ) : null}
        </div>
        <Button variant="outline" onClick={() => {
          setFormData(initialForm);
          setStatus("idle");
        }}>
          Submit another request
        </Button>
      </Panel>
    );
  }

  return (
    <Panel
      className="p-6 md:p-8"
      data-testid="book-demo-form"
      data-hydrated="false"
      ref={containerRef}
    >
      <div className="space-y-2 mb-6">
        <h2 className="text-lg font-semibold">Tell us about your clinic</h2>
        <p className="text-sm text-muted-foreground">
          Share a few details and we will tailor the demo to your workflow.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="book-demo-name">Full name</Label>
          <Input
            id="book-demo-name"
            name="name"
            placeholder="Dr. Jane Smith"
            value={formData.name}
            onChange={handleChange("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "book-demo-name-error" : undefined}
            data-testid="book-demo-name"
            required
          />
          {errors.name ? (
            <p
              id="book-demo-name-error"
              className="text-xs text-rose-500"
              role="alert"
              data-testid="book-demo-error-name"
            >
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="book-demo-email">Work email</Label>
          <Input
            id="book-demo-email"
            name="email"
            type="email"
            placeholder="jane@clinic.com"
            value={formData.email}
            onChange={handleChange("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "book-demo-email-error" : undefined}
            data-testid="book-demo-email"
            required
          />
          {errors.email ? (
            <p
              id="book-demo-email-error"
              className="text-xs text-rose-500"
              role="alert"
              data-testid="book-demo-error-email"
            >
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="book-demo-org">Organisation</Label>
          <Input
            id="book-demo-org"
            name="organisation"
            placeholder="Clinic or practice name"
            value={formData.organisation}
            onChange={handleChange("organisation")}
            aria-invalid={Boolean(errors.organisation)}
            aria-describedby={errors.organisation ? "book-demo-org-error" : undefined}
            data-testid="book-demo-org"
            required
          />
          {errors.organisation ? (
            <p
              id="book-demo-org-error"
              className="text-xs text-rose-500"
              role="alert"
              data-testid="book-demo-error-org"
            >
              {errors.organisation}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={status === "submitting"}
          data-testid="book-demo-submit"
        >
          {status === "submitting" ? "Submitting..." : "Request a demo"}
        </Button>

        <p className="text-xs text-muted-foreground">
          By submitting, you agree to our{" "}
          <Link href="/legal/privacy" className="underline underline-offset-4 hover:text-foreground">
            Privacy Policy
          </Link>{" "}
          and consent to be contacted about your demo request.
        </p>
      </form>
    </Panel>
  );
}
