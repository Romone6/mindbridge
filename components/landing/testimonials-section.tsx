"use client";

import { Badge } from "@/components/ui/badge";
import {
  sampleTestimonials,
  testimonials,
  testimonialsConfig,
  type TestimonialsMode,
} from "@/components/landing/testimonials-data";
import { TestimonialsCarousel } from "@/components/landing/testimonials-carousel";

const resolveMode = (mode?: TestimonialsMode): TestimonialsMode => {
  if (!mode) return testimonialsConfig.mode;
  return mode;
};

export function TestimonialsSection({ mode }: { mode?: TestimonialsMode }) {
  const resolvedMode = resolveMode(mode);
  const isHidden = resolvedMode === "hidden";

  if (isHidden) return null;

  const items =
    resolvedMode === "sample"
      ? sampleTestimonials
      : resolvedMode === "empty"
      ? []
      : testimonials;

  const showSampleBadge = resolvedMode === "sample";

  return (
    <section className="section-spacing border-b border-border">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Testimonials
          </Badge>
          <h2>Outcomes we will publish with clinical partners.</h2>
          <p className="text-muted-foreground">
            We only share verified testimonials and approved case studies.
          </p>
        </div>

        <TestimonialsCarousel items={items} showSampleBadge={showSampleBadge} />
      </div>
    </section>
  );
}
