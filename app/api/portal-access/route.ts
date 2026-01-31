import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getPortalAccessCookieName,
  isPortalAccessConfigured,
  verifyPortalAccessToken,
} from "@/lib/security/portal-access";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV !== "production" && !process.env.PORTAL_ACCESS_CODE) {
    return NextResponse.json({ allowed: true });
  }

  if (!isPortalAccessConfigured()) {
    return NextResponse.json({ allowed: false });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(getPortalAccessCookieName())?.value;
  const allowed = verifyPortalAccessToken(token);
  return NextResponse.json({ allowed });
}
