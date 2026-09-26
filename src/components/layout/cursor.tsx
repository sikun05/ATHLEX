"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Mode = "default" | "hover" | "view" | "click" | "hidden";

/** Desktop-only custom cursor. Disabled on touch / coarse pointers and reduced motion. */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("default");
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(fine.matches && !reduce.matches);
    update();
    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest) return;
      const tagged = t.closest<HTMLElement>("[data-cursor]");
      if (tagged) return setMode((tagged.dataset.cursor as Mode) || "hover");
      if (t.closest("input, textarea, select, [contenteditable]")) return setMode("hidden");
      if (t.closest("a, button, [role=button], label, summary")) return setMode("hover");
      setMode("default");
    };
    const leave = () => setMode("hidden");
    const enter = () => setMode("default");
    const pd = () => setDown(true);
    const pu = () => setDown(false);

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    document.documentElement.addEventListener("pointerenter", enter);
    window.addEventListener("pointerdown", pd);
    window.addEventListener("pointerup", pu);
    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.removeEventListener("pointerenter", enter);
      window.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointerup", pu);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = { default: 14, hover: 56, view: 88, click: 76, hidden: 0 }[mode] * (down ? 0.85 : 1);
  const label = mode === "view" ? "View" : mode === "click" ? "Click" : "";

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[120] -translate-x-1/2 -translate-y-1/2"
        style={{ x: sx, y: sy }}
      >
        <motion.div
          animate={{ width: size, height: size }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "flex items-center justify-center rounded-full",
            mode === "default" && "border border-bone/80 mix-blend-difference",
            mode === "hover" && "border border-volt bg-volt/10 backdrop-blur-[1px]",
            (mode === "view" || mode === "click") && "bg-volt",
          )}
        >
          {label && (
            <motion.span initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-ink">
              {label}
            </motion.span>
          )}
        </motion.div>
      </motion.div>
      <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[121] size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-volt" style={{ x, y, opacity: mode === "default" ? 1 : 0 }} />
    </>
  );
}
