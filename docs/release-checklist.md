# Release Checklist

## Routes to click
- `/` (homepage): hero, demo section, waitlist form, footer links.
- `/demo` (public demo page).
- `/clinicians` and `/clinicians/faq`.
- `/pricing`: plans render, buttons work (redirects when Stripe is configured).
- `/legal/privacy` and `/legal/terms`.
- `/dashboard` (signed out -> Clerk sign-in; signed in -> dashboard).

## Expected UI states
- Navbar: signed out shows "Clinician login" + "View demo"; signed in shows "Dashboard" + user menu.
- Footer: shows `© 2025 MindBridge Health Technologies. All rights reserved.` plus pitch deck link and socials.
- Demo section: labeled "Example / simulated data" with guided steps.
- Waitlist: submit shows success toast; duplicate shows "You're already on the list!".
- Pricing: if Stripe envs missing, buttons should fail gracefully; if present, redirect to Stripe Checkout.

## Vercel checks
- Environment variables set:
  - `NEXT_PUBLIC_APP_URL`
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ENTERPRISE`
- Build output: no TypeScript or lint errors.
- `/pricing` and `/api/stripe/checkout` respond in production.

## Clerk checks
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` matches production instance.
- Redirects: sign-in returns to `/dashboard`.
- `/dashboard` protection: signed-out users are redirected to Clerk sign-in.
