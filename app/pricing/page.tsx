import { MainLayout } from "@/components/layout/main-layout";
import { PricingTable, type PricingTier } from "@/components/pricing/pricing-table";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/site-config";

const tiers: PricingTier[] = [
  {
    name: "Starter",
    description: "For small clinics validating structured intake.",
    price: "Invoice only",
    priceNote: "Enterprise invoicing",
    features: [
      "Structured intake workflows",
      "Clinician summary generation",
      "Basic risk flagging",
      "Email support",
    ],
    cta: "Request invoice",
  },
  {
    name: "Pro",
    description: "For multi-clinic teams scaling intake coordination.",
    price: "Invoice only",
    priceNote: "Enterprise invoicing",
    features: [
      "Everything in Starter",
      "Configurable escalation policies",
      "Priority risk review queue",
      "Workspace analytics (no data yet)",
      "Priority support",
    ],
    highlight: true,
    cta: "Request invoice",
  },
  {
    name: "Enterprise",
    description: "For health systems with compliance and integration needs.",
    price: "Invoice only",
    priceNote: "Volume pricing + BAA support",
    features: [
      "Everything in Pro",
      "Dedicated implementation",
      "BAA & compliance reviews",
      "Custom integrations",
      "Success & training program",
    ],
    cta: "Request invoice",
  },
];

export default function PricingPage() {
  return (
    <MainLayout>
      <section className="section-spacing border-b border-border">
        <div className="space-y-4">
          <Badge variant="outline" className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Pricing
          </Badge>
          <h1>Plans built for clinical teams.</h1>
          <p className="text-muted-foreground max-w-2xl">
            Choose the plan that fits your intake volume. Pricing is monthly and designed for regulated clinical
            environments.
          </p>
        </div>
      </section>

      <section className="section-spacing border-b border-border">
        <PricingTable tiers={tiers} />
      </section>

      <section className="section-spacing">
        <div className="max-w-2xl space-y-3 text-sm text-muted-foreground">
          <p>
            Need a custom rollout or regional hosting? Email{" "}
            <a className="underline underline-offset-4 hover:text-foreground" href={`mailto:${siteConfig.contactEmails.sales}`}>
              {siteConfig.contactEmails.sales}
            </a>{" "}
            and we will coordinate a deployment plan.
          </p>
          <p>
            Pricing is invoiced. To get started, request an invoice and we will coordinate procurement.
          </p>
        </div>
      </section>
    </MainLayout>
  );
}
