"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

let hasNavigated = false;

/**
 * Used from template.tsx, which re-mounts on every navigation.
 * A charcoal curtain wipes away while the new page scales/clips in.
 * The very first page load is handled by the preloader instead.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const animateIn = hasNavigated && !reduce;
  useEffect(() => {
    hasNavigated = true;
  }, []);

  if (!animateIn) return <>{children}</>;

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[70] origin-top bg-coal"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-volt" />
      </motion.div>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.985, clipPath: "inset(6% 0% 0% 0%)" }}
        animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        onAnimationComplete={() => {
          // Drop clip-path/transform so sticky & fixed descendants behave normally.
          if (ref.current) {
            ref.current.style.clipPath = "";
            ref.current.style.transform = "";
          }
        }}
        style={{ transformOrigin: "50% 0%" }}
      >
        {children}
      </motion.div>
    </>
  );
}
