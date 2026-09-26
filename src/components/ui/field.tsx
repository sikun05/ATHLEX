"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Label + control + animated error message, wired for screen readers. */
export function Field({
  id,
  label,
  error,
  hint,
  children,
  className,
  required,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-smoke">
        {label}
        {required && <span className="text-volt"> *</span>}
      </label>
      <motion.div animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
        {children}
      </motion.div>
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-danger"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-xs text-ash">
            {hint}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Props helper for inputs rendered inside <Field>. */
export const fieldA11y = (id: string, error?: string) => ({
  id,
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-error` : undefined,
});
