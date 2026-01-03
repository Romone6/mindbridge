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
  const [hidden, setHidden] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    
    // Hide navbar on scroll down, show on scroll up
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }

    // Add background styling when scrolled
    if (latest > 20) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  const routes = [
    { href: "/demo", label: "LIVE DEMO" },
    { href: "/clinicians", label: "PARTNERS" },
    { href: "/research", label: "RESEARCH" },
  ];

  const navVariants = {
    visible: { y: 0, opacity: 1 },
    hidden: { y: -100, opacity: 0 },
  };

  return (
    <motion.header
      variants={navVariants}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm" 
          : "bg-transparent border-transparent"
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Brand - Monospace Technical */}
        <Link href="/" className="flex items-center gap-2 font-mono text-sm tracking-widest font-bold uppercase group">
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.5 }}
          >
            <Image src="/logo.svg" alt="MindBridge Logo" width={24} height={24} className="text-primary" />
          </motion.div>
          <span className="group-hover:text-primary transition-colors">MindBridge_OS</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="relative text-xs font-medium tracking-wide group"
            >
              <span className={cn(
                "relative z-10 transition-colors duration-200",
                pathname === route.href ? "text-foreground font-bold" : "text-muted-foreground group-hover:text-primary"
              )}>
                {route.label}
              </span>
              {pathname === route.href && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}

          <div className="h-4 w-px bg-border" />

          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="text-xs font-medium tracking-wide transition-colors text-muted-foreground hover:text-primary uppercase font-mono relative overflow-hidden group">
                <span className="relative z-10">ACCESS_PORTAL</span>
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-primary transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="font-mono text-xs rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                VIEW_DASHBOARD
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
                    className="block py-2 text-sm font-mono border-l-2 border-transparent pl-2 hover:border-primary hover:bg-muted/50 transition-all"
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
                    <Button className="w-full font-mono">DASHBOARD</Button>
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button className="w-full font-mono">ACCESS_PORTAL</Button>
                  </SignInButton>
                </SignedOut>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
