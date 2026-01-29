import { headers } from "next/headers";
import { auth } from "@/lib/auth/better-auth";

export async function getServerSession() {
  const requestHeaders = await headers();
  return auth.api.getSession({ headers: requestHeaders });
}

export async function getServerUserId() {
  const session = await getServerSession();
  return session?.user?.id ?? null;
}
