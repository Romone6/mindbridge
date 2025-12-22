// Stripe disabled stub — keep names used elsewhere but do not import stripe package
const stripeKey = process.env.STRIPE_SECRET_KEY;

export const isStripeEnabled = Boolean(stripeKey);

export const stripe = {
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

export const STRIPE_PRICES = {
    PROACTIVE_CARE: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROACTIVE_CARE || 'price_proactive_care',
    CLINICS: process.env.NEXT_PUBLIC_STRIPE_PRICE_CLINICS || 'price_clinics',
    PAYERS: process.env.NEXT_PUBLIC_STRIPE_PRICE_PAYERS || 'price_payers',
};
