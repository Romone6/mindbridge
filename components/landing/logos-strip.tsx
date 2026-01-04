"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ShieldCheck, Lock, UserCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  logosConfig,
  partnerLogos,
  samplePartners,
  standards,
  type LogosMode,
  type PartnerLogo,
} from "@/components/landing/logos-strip-data";

const iconMap: Record<string, LucideIcon> = {
  soc2: ShieldCheck,
  hipaa: Lock,
  oversight: UserCheck,
};

const allowedModes = new Set<LogosMode>(["auto", "standards", "partners", "hidden", "sample"]);

function resolveMode(mode?: LogosMode, searchOverride?: string | null): LogosMode {
  if (searchOverride && allowedModes.has(searchOverride as LogosMode)) {
    return searchOverride as LogosMode;
  }
  return mode ?? logosConfig.mode;
}

export function LogosStrip({ mode }: { mode?: LogosMode }) {
  const searchParams = useSearchParams();
  const overrideMode = searchParams?.get("logos");
  const resolvedMode: LogosMode = resolveMode(mode, overrideMode);

  if (resolvedMode === "hidden") {
    return null;
  }

  const partnerItems: PartnerLogo[] =
    resolvedMode === "sample" ? samplePartners : partnerLogos;

  const hasPartners = partnerItems.length > 0;
  const showPartners = hasPartners && resolvedMode !== "standards";
  const showStandards = !showPartners;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Trust signals
        </div>
        {resolvedMode === "sample" ? (
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Sample only
          </Badge>
        ) : null}
      </div>

      {showPartners ? (
        <div
          className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground"
          role="list"
          data-testid="logos-partners"
        >
          {partnerItems.map((partner) => {
            const content = partner.imageSrc && !partner.textOnly ? (
              <Image
                src={partner.imageSrc}
                alt={partner.alt}
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">
                {partner.name}
              </span>
            );

            return (
              <div
                key={partner.name}
                className={cn(
                  "flex items-center justify-center rounded-[var(--radius)]",
                  "border border-border bg-background px-4 py-2"
                )}
                role="listitem"
                aria-label={partner.alt}
              >
                {partner.href ? (
                  <a href={partner.href} target="_blank" rel="noreferrer">
                    {content}
                  </a>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {showStandards ? (
        <div
          className="grid gap-3 sm:grid-cols-3"
          role="list"
          data-testid="logos-standards"
        >
          {standards.map((item) => {
            const Icon = iconMap[item.key];
            return (
              <div
                key={item.key}
                className="flex items-center gap-3 rounded-[var(--radius)] border border-border bg-muted/30 px-3 py-2"
                role="listitem"
                aria-label={`${item.label} — ${item.status}`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
                  <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </span>
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {item.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
