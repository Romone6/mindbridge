import { Variants, Easing } from "framer-motion";

/**
 * Standard easing curves for consistent motion feel
 */
export const easing: Record<string, Easing> = {
  easeOutQuart: [0.25, 1, 0.5, 1],
  easeInOutQuart: [0.76, 0, 0.24, 1],
  easeOutExpo: [0.19, 1, 0.22, 1],
};

/**
 * Fade in from opacity 0
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, ease: easing.easeOutQuart }
  },
};

/**
 * Fade up with slight vertical movement
 * Ideal for cards, text blocks, and hero elements
 */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: easing.easeOutQuart }
  },
};

/**
 * Stagger children animations
 * Use this on the parent container
 */
export const staggerChildren = (staggerDelay: number = 0.1): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
    },
  },
});

/**
 * Slide in from a direction
 */
export const slideIn = (direction: "left" | "right" | "up" | "down"): Variants => {
  return {
    hidden: {
      x: direction === "left" ? -20 : direction === "right" ? 20 : 0,
      y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
      opacity: 0,
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: easing.easeOutQuart },
    },
  };
};

/**
 * Scale in from smaller size
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: easing.easeOutQuart }
  },
};

/**
 * Rotate and scale slightly on hover
 * Useful for interactive cards or buttons
 */
export const rotateHover: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: { 
    scale: 1.03, 
    rotate: 1,
    transition: { duration: 0.3, ease: easing.easeOutQuart }
  },
};

/**
 * Parallax configuration helper
 * Returns transition settings for smooth parallax effects
 */
export const parallaxConfig = {
  type: "spring",
  stiffness: 100,
  damping: 30,
  restDelta: 0.001
};
