import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const { priceId } = await request.json();

    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }

    const allowedPrices = [
      process.env.STRIPE_PRICE_STARTER,
      process.env.STRIPE_PRICE_PRO,
      process.env.STRIPE_PRICE_ENTERPRISE,
    ].filter(Boolean);

    if (allowedPrices.length && !allowedPrices.includes(priceId)) {
      return NextResponse.json({ error: "Invalid price selection" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${appUrl}/access?stripe_session_id={CHECKOUT_SESSION_ID}&next=${encodeURIComponent(
      "/auth/sign-in"
    )}`;
    const cancelUrl = `${appUrl}/pricing?status=cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      client_reference_id: "mindbridge-pricing",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Unable to create checkout session" }, { status: 500 });
  }
}
