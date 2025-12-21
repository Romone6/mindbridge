import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(stripeKey, {
    // Using a stable API version - update if you pin a different one
    apiVersion: '2024-11-20.acacia',
    typescript: true,
});

export const STRIPE_PRICES = {
    PROACTIVE_CARE: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROACTIVE_CARE || 'price_proactive_care',
    CLINICS: process.env.NEXT_PUBLIC_STRIPE_PRICE_CLINICS || 'price_clinics',
    PAYERS: process.env.NEXT_PUBLIC_STRIPE_PRICE_PAYERS || 'price_payers',
};
