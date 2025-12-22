import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';
import { stripe, isStripeEnabled } from '@/lib/stripe';
// Stripe package removed; webhook handling uses stubbed `stripe`
// import { supabase } from '@/lib/supabase'; // Uncomment when ready to use

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
    if (!isStripeEnabled || !webhookSecret) {
        return NextResponse.json({ error: 'Stripe webhooks disabled' }, { status: 501 });
    }
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`⚠️ Webhook signature verification failed: ${errorMessage}`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event (same as before)
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const tier = session.metadata?.tier;

            console.log('✅ Checkout completed:', {
                sessionId: session.id,
                userId,
                tier,
                customerEmail: session.customer_details?.email,
                amount: session.amount_total ? session.amount_total / 100 : 0,
                currency: session.currency?.toUpperCase(),
            });

            // TODOs left as comments for later
            break;
        }

        case 'customer.subscription.created': {
            const subscription = event.data.object as Stripe.Subscription;
            const userId = subscription.metadata?.userId;

            console.log('📝 Subscription created:', {
                subscriptionId: subscription.id,
                userId,
                status: subscription.status,
                currentPeriodEnd: 'current_period_end' in subscription
                    ? new Date((subscription as Record<string, unknown>).current_period_end as number * 1000)
                    : null,
            });

            break;
        }

        default:
            console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, type: event.type });
}
