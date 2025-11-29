"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export function GlassCard({
  children,
  className,
  gradient = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md",
        "shadow-xl transition-all duration-300",
        gradient &&
          "bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {/* Subtle noise texture overlay could go here */}
      <div className="relative z-10">{children}</div>
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </motion.div>
  );
}
