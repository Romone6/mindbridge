"use client";

import React, { useRef } from "react";
import { motion, useTransform, useMotionValue, useSpring } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Activity, Bell, Search, LayoutGrid, Calendar, FileText, Settings, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { fadeUp, staggerChildren, parallaxConfig } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Animated Dashboard Preview Component
 * 
 * Features:
 * - High-fidelity dashboard mock UI with parallax layers
 * - Interactive tilt effect on hover
 * - Floating elements (notifications, stats) that move independently
 * - Scroll-triggered entrance animations
 * 
 * @example
 * ```tsx
 * <AnimatedDashboardPreview />
 * ```
 */
export function AnimatedDashboardPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Removed unused y and rotateX transforms to clean up lint errors
  
  return (
    <section ref={containerRef} className="w-full py-24 bg-muted/30 overflow-hidden perspective-1000">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren(0.1)}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp}>
            <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
              Clinical OS v2.0
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Designed for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Clinical Workflow</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground">
            A centralized command center that brings triage, documentation, and patient monitoring into one intuitive interface.
          </motion.p>
        </motion.div>

        {/* Dashboard Preview Container */}
        <div className="relative mx-auto max-w-6xl">
          <TiltContainer>
            <motion.div 
              style={{ rotateX: 0 }} // Reset rotation for the main card, let the container handle tilt
              className="relative rounded-xl border bg-background shadow-2xl overflow-hidden"
            >
              {/* Fake Browser UI */}
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                </div>
                <div className="mx-auto px-3 py-1 bg-muted/50 rounded-md text-[10px] text-muted-foreground font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  app.mindbridge.os
                </div>
              </div>

              {/* Dashboard Layout */}
              <div className="flex h-[600px]">
                {/* Sidebar */}
                <div className="w-16 md:w-64 border-r bg-muted/10 p-4 flex flex-col gap-2">
                  <div className="mb-6 px-2 flex items-center gap-2 font-bold text-lg">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <span className="hidden md:inline">MindBridge</span>
                  </div>
                  
                  <SidebarItem icon={LayoutGrid} label="Dashboard" active />
                  <SidebarItem icon={Users} label="Patients" />
                  <SidebarItem icon={Calendar} label="Schedule" />
                  <SidebarItem icon={FileText} label="Documentation" />
                  <div className="mt-auto">
                    <SidebarItem icon={Settings} label="Settings" />
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                  {/* Header */}
                  <div className="h-16 border-b flex items-center justify-between px-6">
                    <div className="flex items-center gap-4 text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-md w-64">
                      <Search className="w-4 h-4" />
                      <span className="text-sm">Search patients...</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="icon" className="relative">
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                      </Button>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="p-6 overflow-hidden bg-muted/5">
                    <div className="grid gap-6 md:grid-cols-3 mb-6">
                      <StatCard title="Active Patients" value="1,284" trend="+12%" />
                      <StatCard title="Triage Queue" value="14" trend="-2" trendDown />
                      <StatCard title="Avg. Response" value="1.2m" trend="-15s" />
                    </div>

                    <div className="rounded-xl border bg-background shadow-sm">
                      <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold">Priority Triage Queue</h3>
                        <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                      </div>
                      <div className="divide-y">
                        <PatientRow 
                          name="Sarah Jenkins" 
                          time="2m ago" 
                          risk="High" 
                          status="Analysis Complete"
                          score={92}
                        />
                        <PatientRow 
                          name="Michael Chen" 
                          time="14m ago" 
                          risk="Moderate" 
                          status="Awaiting Review"
                          score={65}
                        />
                        <PatientRow 
                          name="Emma Wilson" 
                          time="28m ago" 
                          risk="Low" 
                          status="Scheduled"
                          score={12}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Elements (Parallax Layers) */}
            <FloatingElement x={-40} y={-40} z={40} delay={0.2}>
              <div className="bg-background/90 backdrop-blur-md border p-4 rounded-xl shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Triage Status</div>
                  <div className="text-sm font-bold">All Clear</div>
                </div>
              </div>
            </FloatingElement>

            <FloatingElement x={40} y={80} z={60} delay={0.4}>
              <div className="bg-background/90 backdrop-blur-md border p-4 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold">Risk Analysis</span>
                </div>
                <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "75%" }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                  />
                </div>
              </div>
            </FloatingElement>

          </TiltContainer>
        </div>
      </div>
    </section>
  );
}

// Sub-components for clean code structure

function SidebarItem({ icon: Icon, label, active }: { icon: React.ElementType, label: string, active?: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}>
      <Icon className="w-4 h-4" />
      <span className="hidden md:inline">{label}</span>
    </div>
  );
}

function StatCard({ title, value, trend, trendDown }: { title: string, value: string, trend: string, trendDown?: boolean }) {
  return (
    <div className="p-4 rounded-xl border bg-background shadow-sm">
      <div className="text-xs font-medium text-muted-foreground mb-1">{title}</div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold">{value}</div>
        <div className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full", trendDown ? "bg-red-500/10 text-red-600" : "bg-green-500/10 text-green-600")}>
          {trend}
        </div>
      </div>
    </div>
  );
}

function PatientRow({ name, time, risk, status, score }: { name: string, time: string, risk: string, status: string, score: number }) {
  return (
    <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
          {name.charAt(0)}
        </div>
        <div>
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">{time}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-xs font-medium">{status}</div>
          <div className="text-xs text-muted-foreground">Risk Score: {score}</div>
        </div>
        <Badge variant={risk === "High" ? "destructive" : risk === "Moderate" ? "secondary" : "outline"}>
          {risk}
        </Badge>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}

function TiltContainer({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, parallaxConfig);
  const mouseY = useSpring(y, parallaxConfig);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative transition-all duration-200 ease-out"
    >
      {children}
    </motion.div>
  );
}

function FloatingElement({ children, x, y, z, delay }: { children: React.ReactNode, x: number, y: number, z: number, delay: number }) {
  return (
    <motion.div
      style={{
        transform: `translate3d(${x}px, ${y}px, ${z}px)`,
      }}
      initial={{ opacity: 0, y: y + 20 }}
      whileInView={{ opacity: 1, y: y }}
      transition={{ delay, duration: 0.5 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    >
      {children}
    </motion.div>
  );
}
