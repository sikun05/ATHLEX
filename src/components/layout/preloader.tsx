"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { LogoMark } from "@/components/ui/logo";

const KEY = "athlex:preloaded";

export const markPreloaded = () => {
  (window as unknown as { __athlexPreloaded?: boolean }).__athlexPreloaded = true;
  window.dispatchEvent(new Event(KEY));
};

const isPreloaded = () =>
  Boolean((window as unknown as { __athlexPreloaded?: boolean }).__athlexPreloaded) || document.documentElement.classList.contains("skip-preloader");
const subscribe = (cb: () => void) => {
  window.addEventListener(KEY, cb);
  return () => window.removeEventListener(KEY, cb);
};

/** True once the intro sequence has finished (or immediately if it was skipped). */
export function usePreloaded() {
  return useSyncExternalStore(subscribe, isPreloaded, () => false);
}

/** Inline, render-blocking check so returning visitors never see the intro flash. */
export const preloaderScript = `try{if(sessionStorage.getItem("${KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("skip-preloader")}}catch(e){document.documentElement.classList.add("skip-preloader")}`;

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (document.documentElement.classList.contains("skip-preloader")) {
      const id = requestAnimationFrame(() => {
        setVisible(false);
        markPreloaded();
      });
      return () => cancelAnimationFrame(id);
    }
    let raf = 0;
    const start = performance.now();
    const DURATION = 1300;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / DURATION);
      setProgress(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else
        setTimeout(() => {
          setVisible(false);
          try {
            sessionStorage.setItem(KEY, "1");
          } catch {}
          markPreloaded();
        }, 180);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="preloader"
          role="status"
          aria-label="Loading ATHLEX"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: [0.8, 1, 1.08] }}
            transition={{ duration: 1.3, times: [0, 0.5, 1], ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-5"
          >
            <LogoMark className="size-16" />
            <span className="display text-5xl tracking-[0.08em]">ATHLEX</span>
          </motion.div>
          <div className="absolute bottom-12 left-1/2 w-56 -translate-x-1/2">
            <div className="mb-3 flex justify-between font-mono text-[0.65rem] tracking-[0.2em] text-smoke">
              <span>LOADING</span>
              <span className="tabular-nums text-volt">{String(progress).padStart(3, "0")}</span>
            </div>
            <div className="h-px w-full bg-white/10">
              <div className="h-px bg-volt transition-[width] duration-75" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
