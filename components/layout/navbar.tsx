"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const routes = [
        { href: "/demo", label: "LIVE DEMO" },
        { href: "/clinicians", label: "PARTNERS" },
        { href: "/research", label: "RESEARCH" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
                {/* Brand - Monospace Technical */}
                <Link href="/" className="flex items-center gap-2 font-mono text-sm tracking-widest font-bold uppercase">
                    <div className="h-4 w-4 bg-primary" />
                    MindBridge_OS
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={`text-xs font-medium tracking-wide transition-colors hover:text-primary ${pathname === route.href
                                ? "text-foreground font-bold"
                                : "text-muted-foreground"
                                }`}
                        >
                            {route.label}
                        </Link>
                    ))}

                    <div className="h-4 w-px bg-border" />

                    <SignedIn>
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm" className="font-mono text-xs">
                                VIEW_DASHBOARD
                            </Button>
                        </Link>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                            <Button size="sm" variant="default" className="font-mono text-xs">
                                ACCESS_PORTAL
                            </Button>
                        </SignInButton>
                    </SignedOut>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-foreground border border-border rounded-sm"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
            </div>

            {/* Mobile Nav - Brutalist List */}
            {isOpen && (
                <div className="md:hidden border-b border-border bg-background">
                    <nav className="flex flex-col p-4 space-y-2">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setIsOpen(false)}
                                className="block py-2 text-sm font-mono border-l-2 border-transparent pl-2 hover:border-primary hover:bg-muted/50"
                            >
                                {route.label}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-border mt-2">
                            <SignedIn>
                                <Link href="/dashboard" className="w-full">
                                    <Button className="w-full font-mono">DASHBOARD</Button>
                                </Link>
                            </SignedIn>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <Button className="w-full font-mono">ACCESS_PORTAL</Button>
                                </SignInButton>
                            </SignedOut>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
