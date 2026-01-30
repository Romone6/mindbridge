import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { upsertAllowlistedEmail } from "@/lib/security/portal-allowlist";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook secret is not configured" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const payload = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "invoice.paid") {
      const invoice = event.data.object as {
        customer?: string | null;
        customer_email?: string | null;
      };

      let email = invoice.customer_email ?? null;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : null;

      if (!email && customerId) {
        const customer = await stripe.customers.retrieve(customerId);
        const maybeEmail =
          typeof customer === "object" && customer && "email" in customer
            ? (customer.email as string | null)
            : null;
        email = maybeEmail;
      }

      if (email) {
        const result = await upsertAllowlistedEmail({
          email,
          source: "stripe:invoice.paid",
          stripeCustomerId: customerId,
        });
        if (!result.ok) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as {
        customer?: string | null;
        customer_details?: { email?: string | null } | null;
      };

      const email = session.customer_details?.email ?? null;
      const customerId = typeof session.customer === "string" ? session.customer : null;

      if (email) {
        const result = await upsertAllowlistedEmail({
          email,
          source: "stripe:checkout.session.completed",
          stripeCustomerId: customerId,
        });
        if (!result.ok) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
}
