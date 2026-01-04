"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export type PricingTier = {
  name: string;
  description: string;
  price: string;
  priceNote?: string;
  priceId?: string;
  features: string[];
  highlight?: boolean;
  cta: string;
};

interface PricingTableProps {
  tiers: PricingTier[];
}

export function PricingTable({ tiers }: PricingTableProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const startCheckout = async (tier: PricingTier) => {
    if (!tier.priceId) {
      window.location.href = `mailto:${siteConfig.contactEmails.sales}`;
      return;
    }

    try {
      setLoadingTier(tier.name);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: tier.priceId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to start checkout");
      }

      window.location.href = data.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {tiers.map((tier) => (
        <Panel
          key={tier.name}
          className={`flex h-full flex-col p-6 ${
            tier.highlight ? "border-foreground/20 shadow-[0_16px_40px_rgba(15,23,42,0.08)]" : ""
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              {tier.highlight && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Most selected
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{tier.description}</p>
            <div>
              <div className="text-3xl font-semibold text-foreground">{tier.price}</div>
              {tier.priceNote && <div className="text-xs text-muted-foreground">{tier.priceNote}</div>}
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            {tier.features.map((feature) => (
              <div key={feature} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-foreground" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button
              className="w-full"
              variant={tier.highlight ? "default" : "outline"}
              onClick={() => startCheckout(tier)}
              disabled={loadingTier === tier.name}
            >
              {loadingTier === tier.name ? "Redirecting..." : tier.cta}
            </Button>
          </div>
        </Panel>
      ))}
    </div>
  );
}
