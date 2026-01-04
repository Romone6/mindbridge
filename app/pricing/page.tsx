import { MainLayout } from "@/components/layout/main-layout";
import { PricingTable, type PricingTier } from "@/components/pricing/pricing-table";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/site-config";

const tiers: PricingTier[] = [
  {
    name: "Starter",
    description: "For small clinics validating structured intake.",
    price: "$299 / month",
    priceNote: "Up to 3 clinicians",
    priceId: process.env.STRIPE_PRICE_STARTER,
    features: [
      "Structured intake workflows",
      "Clinician summary generation",
      "Basic risk flagging",
      "Email support",
    ],
    cta: "Start Starter",
  },
  {
    name: "Pro",
    description: "For multi-clinic teams scaling intake coordination.",
    price: "$899 / month",
    priceNote: "Up to 15 clinicians",
    priceId: process.env.STRIPE_PRICE_PRO,
    features: [
      "Everything in Starter",
      "Configurable escalation policies",
      "Priority risk review queue",
      "Workspace analytics (no data yet)",
      "Priority support",
    ],
    highlight: true,
    cta: "Start Pro",
  },
  {
    name: "Enterprise",
    description: "For health systems with compliance and integration needs.",
    price: "Custom",
    priceNote: "Volume pricing + BAA support",
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
    features: [
      "Everything in Pro",
      "Dedicated implementation",
      "BAA & compliance reviews",
      "Custom integrations",
      "Success & training program",
    ],
    cta: "Contact sales",
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
            Checkout is public. If you prefer SSO-only access or an enterprise contract, choose the enterprise tier to
            start the conversation.
          </p>
        </div>
      </section>
    </MainLayout>
  );
}
