import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SignUpClient from "./sign-up-client";
import {
  getPortalAccessCookieName,
  isPortalAccessConfigured,
  verifyPortalAccessToken,
} from "@/lib/security/portal-access";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function buildNextPath(
  pathname: string,
  searchParams: Record<string, string | string[] | undefined> | undefined
) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (typeof value === "string") qs.set(key, value);
    else if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
  }
  const query = qs.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default async function SignUpPage(props: PageProps) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;

  const enforce =
    process.env.NODE_ENV === "production"
      ? isPortalAccessConfigured()
      : Boolean(process.env.PORTAL_ACCESS_CODE);

  if (enforce) {
    const cookieStore = await cookies();
    const token = cookieStore.get(getPortalAccessCookieName())?.value;
    const allowed = verifyPortalAccessToken(token);
    if (!allowed) {
      const nextPath = buildNextPath("/auth/sign-up", searchParams);
      redirect(`/access?next=${encodeURIComponent(nextPath)}`);
    }
  }

  return <SignUpClient />;
}
