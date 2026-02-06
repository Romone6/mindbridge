import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SignInClient from "./sign-in-client";
import {
  getPortalAccessCookieName,
  isPortalAccessConfigured,
  verifyPortalAccessToken,
} from "@/lib/security/portal-access";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function buildNextPath(
  pathname: string,
  searchParams: PageProps["searchParams"]
) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
  }
  const query = qs.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default async function SignInPage(props: PageProps) {
  const enforce =
    process.env.NODE_ENV === "production"
      ? isPortalAccessConfigured()
      : Boolean(process.env.PORTAL_ACCESS_CODE);

  if (enforce) {
    const cookieStore = await cookies();
    const token = cookieStore.get(getPortalAccessCookieName())?.value;
    const allowed = verifyPortalAccessToken(token);
    if (!allowed) {
      const nextPath = buildNextPath("/auth/sign-in", props.searchParams);
      redirect(`/access?next=${encodeURIComponent(nextPath)}`);
    }
  }

  return <SignInClient />;
}
