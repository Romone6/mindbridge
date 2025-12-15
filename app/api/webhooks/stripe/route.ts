import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
// import { supabase } from '@/lib/supabase'; // Uncomment when ready to use

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
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

            // TODO: Update user's subscription status in database
            // if (supabase && userId) {
            //     await supabase
            //         .from('user_subscriptions')
            //         .upsert({
            //             user_id: userId,
            //             tier: tier,
            //             stripe_customer_id: session.customer,
            //             stripe_subscription_id: session.subscription,
            //             status: 'active',
            //             current_period_start: new Date(),
            //         });
            // }

            // TODO: Send welcome email
            // await sendEmail({
            //     to: session.customer_details?.email,
            //     template: 'welcome',
            //     data: { tier }
            // });

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

            // Grant user access to product
            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;

            console.log('🔄 Subscription updated:', {
                subscriptionId: subscription.id,
                status: subscription.status,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
            });

            // TODO: Update subscription in database
            // Handle plan changes, quantity updates, etc.
            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;

            console.log('❌ Subscription canceled:', {
                subscriptionId: subscription.id,
                canceledAt: new Date(subscription.canceled_at! * 1000),
            });

            // TODO: Revoke user access and update database
            // if (supabase) {
            //     await supabase
            //         .from('user_subscriptions')
            //         .update({ 
            //             status: 'canceled', 
            //             canceled_at: new Date() 
            //         })
            //         .eq('stripe_subscription_id', subscription.id);
            // }

            // TODO: Send cancellation confirmation email
            break;
        }

        case 'customer.subscription.trial_will_end': {
            const subscription = event.data.object as Stripe.Subscription;
            const trialEnd = new Date(subscription.trial_end! * 1000);

            console.log('⏰ Trial ending soon:', {
                subscriptionId: subscription.id,
                trialEndsAt: trialEnd,
                daysRemaining: Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
            });

            // TODO: Send trial ending reminder email
            // Great opportunity to engage users before trial ends!
            break;
        }

        case 'invoice.payment_succeeded': {
            const invoice = event.data.object as Stripe.Invoice;

            console.log('💰 Payment succeeded:', {
                invoiceId: invoice.id,
                amount: invoice.amount_paid / 100,
                currency: invoice.currency.toUpperCase(),
                subscriptionId: 'subscription' in invoice ? invoice.subscription : null,
            });

            // Confirm subscription renewal
            break;
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;

            console.log('⚠️ Payment failed:', {
                invoiceId: invoice.id,
                attemptCount: invoice.attempt_count,
                amountDue: invoice.amount_due / 100,
                nextPaymentAttempt: invoice.next_payment_attempt
                    ? new Date(invoice.next_payment_attempt * 1000)
                    : null,
            });

            // TODO: Notify user of failed payment
            // Critical for subscription retention!
            // Consider sending email with "Update Payment Method" link
            break;
        }

        case 'entitlements.active_entitlement_summary.updated': {
            const summary = event.data.object;

            console.log('🎫 Active entitlement summary updated:', {
                eventId: event.id,
                customer: summary.customer,
            });

            // Track feature access changes
            break;
        }

        default:
            console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, type: event.type });
}
