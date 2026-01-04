"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/components/landing/testimonials-data";
import { siteConfig } from "@/lib/site-config";

const AUTO_ADVANCE_MS = 8000;

type TestimonialsCarouselProps = {
  items: Testimonial[];
  hidden?: boolean;
  autoAdvance?: boolean;
  showSampleBadge?: boolean;
};

export function TestimonialsCarousel({
  items,
  hidden = false,
  autoAdvance = false,
  showSampleBadge = false,
}: TestimonialsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = items.length;
  const hasItems = total > 0;
  const safeIndex = hasItems ? ((activeIndex % total) + total) % total : 0;

  useEffect(() => {
    if (!autoAdvance || isPaused || total <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [autoAdvance, isPaused, total]);

  const activeItem = useMemo(() => {
    if (!hasItems) return null;
    return items[safeIndex];
  }, [hasItems, items, safeIndex]);

  if (hidden) return null;

  if (!hasItems) {
    return (
      <Panel className="space-y-4 p-6" data-testid="testimonials-empty">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Clinical partners wanted</h3>
            <p className="text-sm text-muted-foreground">
              We will publish verified testimonials once our first pilot cohorts are live.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
            No testimonials yet
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          If you are a clinician or clinic operator interested in co-designing MindBridge, we would love to talk.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="sm" className="w-full sm:w-auto">
            <a href={siteConfig.calendlyDemoUrl} target="_blank" rel="noreferrer">
              Book a demo
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
            <a href={`mailto:${siteConfig.contactEmails.sales}`}>Contact sales</a>
          </Button>
        </div>
      </Panel>
    );
  }

  const handlePrev = () => {
    setActiveIndex((current) => (current - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % total);
  };

  return (
    <div
      className="space-y-4"
      role="region"
      aria-roledescription="carousel"
      aria-label="Testimonials carousel"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          handlePrev();
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          handleNext();
        }
      }}
      data-testid="testimonials-carousel"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Testimonials & case studies
          </div>
          <h3 className="text-lg font-semibold">What clinical teams want to see next.</h3>
        </div>
        <div className="flex items-center gap-2">
          {showSampleBadge ? (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Sample only
            </Badge>
          ) : null}
          {autoAdvance ? (
            <Button
              size="icon"
              variant="ghost"
              aria-label={isPaused ? "Play testimonial rotation" : "Pause testimonial rotation"}
              aria-pressed={isPaused}
              onClick={() => setIsPaused((prev) => !prev)}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          ) : null}
        </div>
      </div>

      <Panel className="relative overflow-hidden p-6" aria-live="polite">
        <div className="space-y-4" data-testid="testimonial-slide">
          <p className="text-base text-foreground">“{activeItem?.quote}”</p>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">
              {activeItem?.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {activeItem?.role} · {activeItem?.organization}
            </div>
            {activeItem?.summary ? (
              <p className="text-xs text-muted-foreground">{activeItem.summary}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {safeIndex + 1} of {total}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              aria-label="Previous testimonial"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Next testimonial"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Panel>

      <div className="flex items-center gap-2">
              {items.map((item, index) => (
                <button
                  key={`${item.name}-${index}`}
                  type="button"
                  aria-label={`Go to testimonial ${index + 1}`}
            aria-current={index === safeIndex}
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
              index === safeIndex ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
      </div>
    </div>
  );
}
