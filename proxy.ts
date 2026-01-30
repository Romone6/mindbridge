import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/better-auth";

function getHosts() {
  const portalHost = process.env.PORTAL_HOST || "portal.mindbridge.health";
  const marketingHost = process.env.MARKETING_HOST || "www.mindbridge.health";
  return { portalHost, marketingHost };
}

function redirectToHost(req: NextRequest, host: string) {
  const url = req.nextUrl.clone();
  url.host = host;
  url.protocol = "https:";
  return NextResponse.redirect(url);
}

const protectedPaths = [
  /^\/dashboard(.*)/,
  /^\/onboarding(.*)/,
  /^\/api\/clinicians(.*)/,
];

const isProtectedRoute = (pathname: string) =>
  protectedPaths.some((pattern) => pattern.test(pathname));

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Host-based routing for separate deploy/projects.
  // Only enforce in production so local dev isn't broken.
  if (process.env.NODE_ENV === "production") {
    const { portalHost, marketingHost } = getHosts();
    const host = req.nextUrl.hostname;
    const isPortalHost = host === portalHost;
    const isMarketingHost = host === marketingHost;

    if (isPortalHost || isMarketingHost) {
      const isAuthPage = pathname.startsWith("/auth");
      const isAuthApi = pathname.startsWith("/api/auth");
      const isDashboard =
        pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");
      const isStripeWebhook = pathname.startsWith("/api/webhooks/stripe");
      const portalOnly = isAuthPage || isAuthApi || isDashboard || isStripeWebhook;

      if (isPortalHost && pathname === "/") {
        const url = req.nextUrl.clone();
        url.pathname = "/auth/sign-in";
        return NextResponse.redirect(url);
      }

      const marketingOnly =
        pathname.startsWith("/pricing") ||
        pathname.startsWith("/demo") ||
        pathname.startsWith("/design-system") ||
        pathname.startsWith("/access");

      if (portalOnly && isMarketingHost) {
        return redirectToHost(req, portalHost);
      }

      if (marketingOnly && isPortalHost) {
        return redirectToHost(req, marketingHost);
      }

    }
  }

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
