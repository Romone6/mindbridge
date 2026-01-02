"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Activity, Shield, Clock } from "lucide-react";
import Link from "next/link";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { fadeUp, staggerChildren, scaleIn, parallaxConfig } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Animated Hero Section Component
 * 
 * Features:
 * - Staggered text animations
 * - 3D tilting card effect using mouse position
 * - Parallax scroll effects
 * - Responsive layout (mobile-first)
 * - Accessible motion preferences support
 * 
 * @example
 * ```tsx
 * <AnimatedHero />
 * ```
 */
export function AnimatedHero() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  
  // Parallax effects for background elements
  const yBackground = useTransform(scrollY, [0, 1000], [0, 400]);
  const yContent = useTransform(scrollY, [0, 1000], [0, 100]);
  
  return (
    <section 
      ref={containerRef} 
      className="relative w-full min-h-[90vh] flex items-center pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-background"
    >
      {/* Dynamic Background */}
      <motion.div 
        style={{ y: yBackground }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-emerald-500/10 blur-[80px] rounded-full mix-blend-multiply dark:mix-blend-screen" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </motion.div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Column: Content */}
        <motion.div 
          variants={staggerChildren(0.1)}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={fadeUp} className="space-y-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="inline-block"
            >
              <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider py-1 px-3 border-primary/20 bg-primary/5 text-primary">
                System Status: Operational
              </Badge>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-foreground leading-[1.05]">
              Patient intake<br />
              that feels<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                like care
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed font-medium">
              MindBridge orchestrates clinical risk assessment with human warmth.
              Built for health systems that prioritize safety and scale.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/demo">
              <Button 
                size="lg" 
                className="group rounded-full h-14 px-10 text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-primary/25"
              >
                See it in action 
                <motion.span
                  className="inline-block ml-2"
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.span>
              </Button>
            </Link>
            
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base font-medium hover:bg-muted/50">
                  Clinician Login
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base font-medium">
                  Go to Dashboard
                </Button>
              </Link>
            </SignedIn>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-6 text-xs font-mono text-muted-foreground pt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>v2.4.0 Live</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>HIPAA Compliant</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Interactive 3D Card */}
        <div className="hidden lg:block perspective-1000">
          <TiltCard />
        </div>
      </div>
    </section>
  );
}

/**
 * 3D Tilt Card Component
 * Handles the mouse interaction and 3D transform logic separately for performance
 */
function TiltCard() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, parallaxConfig);
  const mouseY = useSpring(y, parallaxConfig);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = event.clientX - rect.left - width / 2;
    const mouseYFromCenter = event.clientY - rect.top - height / 2;
    
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-square max-w-[500px] mx-auto cursor-default"
    >
      {/* Floating Elements */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
        style={{ transform: "translateZ(0px)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-emerald-500/5" />
        
        {/* Card Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-bold text-lg">Aiden M.</div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                Intake Complete • 2m ago
              </div>
            </div>
          </div>
          <Badge variant="destructive" className="animate-pulse shadow-lg shadow-red-500/20">
            Elevated Risk
          </Badge>
        </div>

        {/* Card Body */}
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">Clinical Sentiment</span>
              <span className="text-primary font-mono">98% CONF</span>
            </div>
            <div className="h-3 bg-muted/50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "98%" }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Priority</div>
              <div className="flex items-center gap-2 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Immediate
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Action</div>
              <div className="flex items-center gap-2 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Alert Sent
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Badge Element */}
      <motion.div
        style={{ transform: "translateZ(50px)" }}
        className="absolute -right-6 bottom-12 bg-card border border-border p-4 rounded-2xl shadow-xl backdrop-blur-md max-w-[200px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xs font-bold">Response Time</div>
        </div>
        <div className="text-2xl font-bold font-mono text-emerald-500">&lt; 2m</div>
      </motion.div>
    </motion.div>
  );
}
