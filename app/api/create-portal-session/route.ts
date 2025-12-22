import { NextResponse } from 'next/server';
import { stripe, isStripeEnabled } from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';

/**
 * Create Stripe Customer Portal Session
 * Allows users to manage subscriptions, payment methods, and invoices
 */
export async function POST(req: Request) {
    try {
        if (!isStripeEnabled) {
            return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
        }
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID required' },
                { status: 400 }
            );
        }

        // Retrieve the checkout session to get the customer ID
        const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

        if (!checkoutSession.customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        // Create portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: checkoutSession.customer as string,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        });

        return NextResponse.json({ url: portalSession.url });

    } catch (error: unknown) {
        console.error('Portal session error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create portal session';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
