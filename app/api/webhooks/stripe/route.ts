import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Admin client for webhook updates
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;
        const clinicId = session.metadata.clinicId;

        if (!clinicId) {
            return new NextResponse("Clinic ID missing in metadata", { status: 400 });
        }

        // Update Clinic with Customer ID
        await supabase
            .from("clinics")
            .update({ stripe_customer_id: session.customer })
            .eq("id", clinicId);

        // Create Subscription Record
        await supabase.from("subscriptions").insert({
            clinic_id: clinicId,
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });
    }

    if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object as any;
        
        await supabase
            .from("subscriptions")
            .update({
                status: subscription.status,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                stripe_price_id: subscription.items.data[0].price.id,
            })
            .eq("stripe_subscription_id", subscription.id);
    }

    if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as any;

        await supabase
            .from("subscriptions")
            .update({
                status: subscription.status,
            })
            .eq("stripe_subscription_id", subscription.id);
    }

    return new NextResponse(null, { status: 200 });
}
