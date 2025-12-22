import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

// Helper flag other modules can check
export const isStripeEnabled = Boolean(stripeKey);

// Export a safe `stripe` object: real Stripe when configured, otherwise a stub
let _stripe: any;
if (stripeKey) {
    _stripe = new Stripe(stripeKey, {
        apiVersion: '2024-11-20',
        typescript: true,
    });
} else {
    // Minimal stub for server code that may import `stripe` during build/runtime.
    const notConfigured = () => {
        throw new Error('Stripe is not configured (STRIPE_SECRET_KEY missing)');
    };

    _stripe = {
        checkout: {
            sessions: {
                create: async () => { throw new Error('Stripe checkout not available'); },
                retrieve: async () => { throw new Error('Stripe checkout not available'); },
            },
        },
        billingPortal: {
            sessions: {
                create: async () => { throw new Error('Stripe billing portal not available'); },
            },
        },
        webhooks: {
            constructEvent: () => { throw new Error('Stripe webhooks not available'); },
        },
    };
}

export const stripe = _stripe;

export const STRIPE_PRICES = {
    PROACTIVE_CARE: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROACTIVE_CARE || 'price_proactive_care',
    CLINICS: process.env.NEXT_PUBLIC_STRIPE_PRICE_CLINICS || 'price_clinics',
    PAYERS: process.env.NEXT_PUBLIC_STRIPE_PRICE_PAYERS || 'price_payers',
};
