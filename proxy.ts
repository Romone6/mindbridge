import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/better-auth";

// Host-based routing removed: running as a single deploy.

const protectedPaths = [
  /^\/dashboard(.*)/,
  /^\/onboarding(.*)/,
  /^\/api\/clinicians(.*)/,
];

const isProtectedRoute = (pathname: string) =>
  protectedPaths.some((pattern) => pattern.test(pathname));

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    const redirectUrl = new URL("/auth/sign-in", req.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
