import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    // @ts-expect-error - Using latest API version
    apiVersion: '2024-11-20.acacia',
    typescript: true,
});

export const STRIPE_PRICES = {
    PROACTIVE_CARE: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROACTIVE_CARE || 'price_proactive_care',
    CLINICS: process.env.NEXT_PUBLIC_STRIPE_PRICE_CLINICS || 'price_clinics',
    PAYERS: process.env.NEXT_PUBLIC_STRIPE_PRICE_PAYERS || 'price_payers',
};
