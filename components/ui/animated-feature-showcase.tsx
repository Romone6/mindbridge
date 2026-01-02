"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fadeUp, staggerChildren, rotateHover } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Activity, ShieldCheck, Zap } from "lucide-react";

/**
 * Props for the AnimatedFeatureShowcase component
 */
interface AnimatedFeatureShowcaseProps {
  /** Optional class name for the container */
  className?: string;
}

/**
 * A feature showcase component with staggered animations, hover effects,
 * and gradient borders. Designed for high-interactivity SaaS landing pages.
 *
 * @example
 * ```tsx
 * <AnimatedFeatureShowcase />
 * ```
 */
export function AnimatedFeatureShowcase({ className }: AnimatedFeatureShowcaseProps) {
  const features = [
    {
      title: "Real-time Analysis",
      description: "Instant clinical insights powered by advanced AI algorithms processing patient data in milliseconds.",
      icon: Zap,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "HIPAA Compliant",
      description: "Enterprise-grade security ensuring your patient data remains protected and compliant with all regulations.",
      icon: ShieldCheck,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Predictive Triage",
      description: "Automated risk stratification helps you prioritize patients who need immediate attention.",
      icon: Activity,
      gradient: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <section className={cn("py-24 px-4 sm:px-6 lg:px-8", className)}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerChildren(0.2)}
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} />
        ))}
      </motion.div>
    </section>
  );
}

interface FeatureCardProps {
  feature: {
    title: string;
    description: string;
    icon: React.ElementType;
    gradient: string;
  };
}

function FeatureCard({ feature }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={fadeUp}
      whileHover="hover"
      initial="rest"
      animate="rest"
      className="relative group"
    >
      {/* Animated Gradient Border Effect */}
      <div
        className={cn(
          "absolute -inset-0.5 rounded-xl opacity-75 blur-sm transition duration-500 group-hover:opacity-100",
          "bg-gradient-to-r",
          feature.gradient
        )}
      />
      
      <motion.div variants={rotateHover} className="h-full">
        <Card className="relative h-full bg-card border-0 shadow-sm overflow-hidden">
          {/* Subtle Radial Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          <CardHeader>
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br", feature.gradient)}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              {feature.description}
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
