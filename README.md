# MindBridge

## Local dev

```bash
npm run dev
```

## Production domains (separate deploy/projects)

This repo is deployed as two separate projects:

- Marketing site: `https://www.mindbridge.health`
- Clinician portal: `https://portal.mindbridge.health`

`middleware.ts` enforces host-based routing in production so portal routes don’t serve on the marketing domain (and vice versa).

### Required env per project

Marketing project (www):
- `NEXT_PUBLIC_APP_URL=https://www.mindbridge.health`
- `NEXT_PUBLIC_PORTAL_URL=https://portal.mindbridge.health`

Portal project (portal):
- `NEXT_PUBLIC_APP_URL=https://portal.mindbridge.health`
- `BETTER_AUTH_URL=https://portal.mindbridge.health`
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (webhook at `/api/webhooks/stripe`)

Shared:
- Supabase public keys, and `SUPABASE_SERVICE_ROLE_KEY` for server-side allowlisting/webhooks

## Portal access gating

Portal access is granted via `/access` (access code, allowlisted email, or Stripe session), which sets an HttpOnly cookie `mb_portal_access` scoped to `.mindbridge.health`.

## Demo usage limiting

Unauthenticated demo usage to `/api/triage` is limited via a signed HttpOnly cookie (`mb_demo_usage`). Configure:
- `DEMO_USAGE_LIMIT`
- `DEMO_USAGE_WINDOW_SECONDS`
- `DEMO_USAGE_SECRET` (or reuse `BETTER_AUTH_SECRET`)
