"use client";

import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform, animate, type Variants } from "motion/react";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

type Direction = "up" | "down" | "left" | "right" | "scale" | "none";

const offsets: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 60 },
  right: { x: -60 },
  scale: { scale: 0.92 },
  none: {},
};

/** Fade + move into view once. Honors prefers-reduced-motion via MotionConfig. */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.9,
  className,
  as = "div",
  amount = 0.25,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article" | "span";
  amount?: number;
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, ...offsets[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

export const staggerParent = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

export const fadeUpChild: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export function Stagger({ children, className, stagger = 0.08, as = "div" }: { children: ReactNode; className?: string; stagger?: number; as?: "div" | "ul" | "ol" }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={staggerParent(stagger)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" | "article" }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={fadeUpChild}>
      {children}
    </Comp>
  );
}

/**
 * Word-by-word masked reveal: each word rises, fades in and un-blurs.
 * `lines` lets callers control line breaks explicitly.
 */
export function SplitWords({
  text,
  className,
  wordClassName,
  highlight,
  delay = 0,
  stagger = 0.09,
  animateOnMount = false,
  as = "span",
  id,
}: {
  id?: string;
  text: string;
  className?: string;
  wordClassName?: string;
  /** word indexes rendered in the accent colour */
  highlight?: number[];
  delay?: number;
  stagger?: number;
  animateOnMount?: boolean;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}) {
  const words = text.split(" ");
  const Comp = motion[as];
  const viewProps = animateOnMount
    ? { initial: "hidden", animate: "show" }
    : { initial: "hidden", whileInView: "show", viewport: { once: true, amount: 0.4 } };
  return (
    <Comp id={id} className={className} aria-label={text} variants={staggerParent(stagger, delay)} {...viewProps}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
        <span aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className={cn("inline-block", wordClassName, highlight?.includes(i) && "text-volt")}
            variants={{
              hidden: { y: "105%", opacity: 0 },
              show: { y: "0%", opacity: 1, transition: { duration: 1, ease: EASE } },
            }}
          >
            {w}
          </motion.span>
        </span>
        {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Comp>
  );
}

/** Count-up number that starts when it scrolls into view. */
export function Counter({ to, suffix = "", prefix = "", duration = 2, className }: { to: number; suffix?: string; prefix?: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) return;
    const controls = animate(0, to, { duration, ease: EASE, onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">
        {prefix}
        {to}
        {suffix}
      </span>
      <span aria-hidden>
        {prefix}
        {(reduce && inView ? to : value).toLocaleString("en-IN")}
        {suffix}
      </span>
    </span>
  );
}

/** Vertical parallax wrapper for imagery. */
export function Parallax({ children, className, offset = 80 }: { children: ReactNode; className?: string; offset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [-offset, offset]), { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y: reduce ? 0 : y, top: -offset, bottom: -offset }} className="absolute inset-x-0">
        {children}
      </motion.div>
    </div>
  );
}

/** Clip-path wipe reveal for images and blocks. */
export function ClipReveal({ children, className, delay = 0, from = "bottom" }: { children: ReactNode; className?: string; delay?: number; from?: "bottom" | "left" | "right" }) {
  const initial = {
    bottom: "inset(100% 0% 0% 0%)",
    left: "inset(0% 100% 0% 0%)",
    right: "inset(0% 0% 0% 100%)",
  }[from];
  return (
    <motion.div
      className={className}
      initial={{ clipPath: initial }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.2, delay, ease: [0.76, 0, 0.24, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function useMotionSafe() {
  return !useReducedMotion();
}
