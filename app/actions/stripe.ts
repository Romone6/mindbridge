'use server';

import { stripe, STRIPE_PRICES, isStripeEnabled } from '@/lib/stripe';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function createCheckoutSession(tier: 'proactive' | 'clinics' | 'payers') {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        throw new Error('User not authenticated');
    }

    const priceId = tier === 'proactive'
        ? STRIPE_PRICES.PROACTIVE_CARE
        : tier === 'clinics'
            ? STRIPE_PRICES.CLINICS
            : STRIPE_PRICES.PAYERS;

    if (!isStripeEnabled) {
        // Stripe is intentionally disabled for now; redirect to waitlist
        throw new Error('Stripe not configured');
    }

    try {
        const session = await stripe.checkout.sessions.create({
            customer_email: user.emailAddresses[0]?.emailAddress,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: tier === 'payers' ? 'payment' : 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
            metadata: {
                userId,
                tier,
            },
        });

        if (session.url) {
            redirect(session.url);
        } else {
            throw new Error('Failed to create checkout session');
        }
    } catch (error) {
        console.error('Stripe checkout error:', error);
        throw error;
    }
}
