"use client";

import { useEffect, useState } from "react";

export function useScrollThreshold(threshold = 32) {
  const [isPastThreshold, setIsPastThreshold] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        setIsPastThreshold(window.scrollY >= threshold);
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return isPastThreshold;
}
