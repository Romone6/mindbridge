import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  createPortalAccessToken,
  getPortalAccessCookieName,
  isPortalAccessConfigured,
  isValidPortalAccessCode,
} from "@/lib/security/portal-access";
import { isEmailAllowlisted } from "@/lib/security/portal-allowlist";

export const dynamic = "force-dynamic";

type Body = {
  code?: unknown;
  email?: unknown;
  stripeSessionId?: unknown;
};

export async function POST(request: Request) {
  if (!isPortalAccessConfigured()) {
    return NextResponse.json(
      { error: "Portal access is not configured." },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const stripeSessionId =
    typeof body.stripeSessionId === "string" ? body.stripeSessionId : "";
  const code = typeof body.code === "string" ? body.code : "";
  const email = typeof body.email === "string" ? body.email : "";

  let allowed = false;

  if (stripeSessionId) {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
    const paid =
      session.payment_status === "paid" ||
      session.status === "complete";
    if (!paid) {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 401 }
      );
    }
    allowed = true;
  } else if (code) {
    allowed = isValidPortalAccessCode(code);
  } else if (email) {
    const res = await isEmailAllowlisted(email);
    if (!res.ok) {
      return NextResponse.json({ error: res.error }, { status: 503 });
    }
    allowed = res.allowed;
  }

  if (!allowed) {
    return NextResponse.json({ error: "Access denied" }, { status: 401 });
  }

  const token = createPortalAccessToken({ ttlSeconds: 60 * 60 * 24 * 30 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: getPortalAccessCookieName(),
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: process.env.NODE_ENV === "production" ? ".mindbridge.health" : undefined,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
