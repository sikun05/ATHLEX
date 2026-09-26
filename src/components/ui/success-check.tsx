"use client";

import { motion } from "motion/react";

/** Animated success mark — circle draws, check strokes in, a ring bursts. */
export function SuccessCheck({ size = 96 }: { size?: number }) {
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <motion.span
        className="absolute inset-0 rounded-full bg-volt/20"
        initial={{ scale: 0.6, opacity: 0.9 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        aria-hidden
      />
      <svg viewBox="0 0 52 52" width={size} height={size} aria-hidden>
        <motion.circle cx="26" cy="26" r="24" fill="none" stroke="#c8ff2e" strokeWidth="2.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
        <motion.path
          d="M15 27 l7 7 l15 -16"
          fill="none"
          stroke="#c8ff2e"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, delay: 0.45, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}
