# MindBridge

## Local dev

```bash
npm run dev
```

## Production

This repo runs as a single Next.js deploy.

- App: `https://www.mindbridge.health`

### Required env

- `NEXT_PUBLIC_APP_URL=https://www.mindbridge.health`
- `BETTER_AUTH_URL=https://www.mindbridge.health`
- Supabase public keys, and `SUPABASE_SERVICE_ROLE_KEY` for server-side allowlisting/webhooks

## Portal access gating

Portal access is granted via `/access` (access code, allowlisted email, or Stripe session), which sets an HttpOnly cookie `mb_portal_access` scoped to `.mindbridge.health`.

## Demo usage limiting

Unauthenticated demo usage to `/api/triage` is limited via a signed HttpOnly cookie (`mb_demo_usage`). Configure:
- `DEMO_USAGE_LIMIT`
- `DEMO_USAGE_WINDOW_SECONDS`
- `DEMO_USAGE_SECRET` (or reuse `BETTER_AUTH_SECRET`)
