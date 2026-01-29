"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";

export function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = authClient.useSession();

    const routes = [
        { href: "/clinicians", label: "Clinicians" },
        { href: "/research", label: "Research" },
        { href: "/blog", label: "Blog" },
    ];

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
            <div className="page-container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                    <Image src="/logo.svg" alt="MindBridge Logo" width={32} height={32} />
                    MindBridge
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={`transition-colors hover:text-foreground ${pathname === route.href || pathname?.startsWith(`${route.href}/`)
                                ? "text-foreground"
                                : "text-muted-foreground"
                                }`}
                        >
                            {route.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    {!session?.user ? (
                        <>
                            <Link href="/auth/sign-in">
                                <Button variant="ghost" size="sm">
                                    Clinician login
                                </Button>
                            </Link>
                            <Link href="/demo">
                                <Button size="sm">View demo</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard">
                                <Button variant="outline" size="sm">
                                    Dashboard
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                    await authClient.signOut();
                                    window.location.href = "/";
                                }}
                            >
                                Sign out
                            </Button>
                        </>
                    )}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                >
                    {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
            </div>

            {isOpen && (
                <div className="md:hidden border-t border-border bg-background">
                    <nav className="page-container flex flex-col gap-3 py-4 text-sm">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                onClick={() => setIsOpen(false)}
                                className="rounded-md px-2 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                {route.label}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-2 border-t border-border pt-3">
                            {!session?.user ? (
                                <>
                                    <Link href="/auth/sign-in" className="w-full">
                                        <Button variant="ghost" className="w-full justify-start">
                                            Clinician login
                                        </Button>
                                    </Link>
                                    <Link href="/demo" className="w-full">
                                        <Button className="w-full justify-start">View demo</Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/dashboard" className="w-full">
                                        <Button variant="outline" className="w-full justify-start">
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={async () => {
                                            await authClient.signOut();
                                            window.location.href = "/";
                                        }}
                                    >
                                        Sign out
                                    </Button>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
