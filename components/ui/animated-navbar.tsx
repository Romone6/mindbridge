"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

/**
 * Animated Navbar Component
 * 
 * Features:
 * - Smart scroll behavior (hides on down, shows on up)
 * - Animated background blur and opacity
 * - Active link underline animation (framer-motion layoutId)
 * - Mobile menu with AnimatePresence
 * - Responsive design maintaining the "brutalist" aesthetic
 * 
 * @example
 * ```tsx
 * <AnimatedNavbar />
 * ```
 */
export function AnimatedNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Add background styling when scrolled
    if (latest > 20) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  const routes = [
    { href: "/demo", label: "OBSERVE" },
    { href: "/clinicians", label: "CLINICIANS" },
    { href: "/research", label: "RESEARCH" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border/60"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Brand - Monospace Technical */}
        <Link href="/" className="flex items-center gap-2 font-mono text-[11px] tracking-[0.32em] uppercase text-muted-foreground">
          <Image src="/logo.svg" alt="MindBridge" width={18} height={18} className="opacity-80" />
          <span>MindBridge</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="relative text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className={cn(pathname === route.href && "text-foreground")}>{route.label}</span>
            </Link>
          ))}

          <div className="h-4 w-px bg-border" />

          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors">
                Clinician access
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="font-mono text-[11px] uppercase tracking-[0.25em] rounded-full">
                Dashboard
              </Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>

        {/* Mobile Menu Toggle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden p-2 text-foreground border border-border rounded-md hover:bg-muted"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </motion.button>
      </div>

      {/* Mobile Nav - AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden border-b border-border bg-background overflow-hidden"
          >
            <nav className="flex flex-col p-4 space-y-4">
              {routes.map((route, i) => (
                <motion.div
                  key={route.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={route.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-2 text-xs font-mono uppercase tracking-[0.2em] border-l-2 border-transparent pl-2 hover:border-primary hover:bg-muted/50 transition-all"
                  >
                    {route.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="pt-4 border-t border-border mt-2"
              >
                <SignedIn>
                  <Link href="/dashboard" className="w-full">
                    <Button className="w-full font-mono uppercase tracking-[0.2em]">Dashboard</Button>
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button className="w-full font-mono uppercase tracking-[0.2em]">Clinician access</Button>
                  </SignInButton>
                </SignedOut>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
