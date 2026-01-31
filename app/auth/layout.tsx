import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getPortalAccessCookieName,
  isPortalAccessConfigured,
  verifyPortalAccessToken,
} from "@/lib/security/portal-access";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (process.env.NODE_ENV !== "production" && !process.env.PORTAL_ACCESS_CODE) {
    return children;
  }

  if (!isPortalAccessConfigured()) {
    redirect("/access?next=/auth/sign-in");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(getPortalAccessCookieName())?.value;

  const allowed = verifyPortalAccessToken(token);
  if (!allowed) {
    redirect("/access?next=/auth/sign-in");
  }

  return children;
}
