"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/nav/theme-toggle";
import { useScrollThreshold } from "@/hooks/use-scroll-threshold";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "Integrations", href: "#integrations" },
  { label: "Team", href: "#team" },
  { label: "Blog", href: "#blog" },
  { label: "Demo", href: "/demo" },
];

export function SiteNavbar() {
  const pathname = usePathname();
  const isCompact = useScrollThreshold(32);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const hashItems = useMemo(
    () => navItems.filter((item) => item.href.startsWith("#")),
    []
  );

  useEffect(() => {
    if (!hashItems.length || pathname !== "/") return;

    const sectionIds = hashItems.map((item) => item.href.slice(1));
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0.2, 0.4, 0.6] }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [hashItems, pathname]);

  const resolveHref = (href: string) =>
    href.startsWith("#") ? `/${href}` : href;

  const isActive = (href: string) => {
    if (href.startsWith("#")) {
      if (pathname !== "/") return false;
      return activeSection === href.slice(1);
    }
    return pathname === href;
  };

  const handleLogoClick = () => {
    if (pathname === "/") {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  };

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full border-b border-transparent",
        "backdrop-blur supports-[backdrop-filter]:bg-background/75",
        "motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none",
        isCompact
          ? "bg-background/95 border-border shadow-sm"
          : "bg-background/70",
      ].join(" ")}
    >
      <div
        className={[
          "page-container flex items-center justify-between",
          "motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none",
          isCompact ? "h-14" : "h-20",
        ].join(" ")}
      >
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          aria-label="MindBridge home"
        >
          <Image src="/logo.svg" alt="MindBridge Logo" width={20} height={20} />
          MindBridge
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm text-muted-foreground">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={resolveHref(item.href)}
              className={[
                "transition-colors hover:text-foreground",
                isActive(item.href) ? "text-foreground" : "text-muted-foreground",
              ].join(" ")}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </SignInButton>
            <Link href="/demo">
              <Button size="sm">Book demo</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="sm">Book demo</Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs">
              <div className="flex flex-col gap-6 pt-6">
                <div className="flex flex-col gap-3">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={resolveHref(item.href)}
                        className={[
                          "text-sm font-medium transition-colors",
                          isActive(item.href) ? "text-foreground" : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-border pt-4">
                  <SignedOut>
                    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                      <Button variant="outline" className="w-full justify-start">
                        Log in
                      </Button>
                    </SignInButton>
                    <SheetClose asChild>
                      <Link href="/demo">
                        <Button className="w-full justify-start">Book demo</Button>
                      </Link>
                    </SheetClose>
                  </SignedOut>
                  <SignedIn>
                    <SheetClose asChild>
                      <Link href="/dashboard">
                        <Button variant="outline" className="w-full justify-start">
                          Dashboard
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/demo">
                        <Button className="w-full justify-start">Book demo</Button>
                      </Link>
                    </SheetClose>
                    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                      <span className="text-sm text-muted-foreground">Account</span>
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </SignedIn>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
