export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  organization: string;
  summary?: string;
  isSample?: boolean;
};

export type TestimonialsMode = "auto" | "empty" | "sample" | "hidden";

export const testimonialsConfig: { mode: TestimonialsMode } = {
  mode: "auto",
};

export const testimonials: Testimonial[] = [];

export const sampleTestimonials: Testimonial[] = [
  {
    quote: "Placeholder testimonial. Replace with a verified clinician quote before publishing.",
    name: "Sample clinician",
    role: "Clinical lead",
    organization: "Placeholder clinic",
    summary: "Sample-only preview of testimonial layout.",
    isSample: true,
  },
  {
    quote: "Placeholder case study highlight. Real outcomes will replace this once approved.",
    name: "Sample operations",
    role: "Clinic operations",
    organization: "Placeholder network",
    summary: "Sample-only preview of case study content.",
    isSample: true,
  },
];
