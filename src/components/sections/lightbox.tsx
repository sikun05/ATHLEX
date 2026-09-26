"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import type { GalleryItem } from "@/lib/types";
import { Photo } from "@/components/ui/photo";
import { pad } from "@/lib/utils";

export function Lightbox({ items, index, onClose, onIndex }: { items: GalleryItem[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null;
  const item = open ? items[index] : null;

  const go = useCallback((dir: 1 | -1) => index !== null && onIndex((index + dir + items.length) % items.length), [index, items.length, onIndex]);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [open, go, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {item && index !== null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} — image ${index + 1} of ${items.length}`}
          className="fixed inset-0 z-[95] flex flex-col bg-ink/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between p-4 sm:p-6">
            <p className="font-mono text-xs tracking-[0.2em] text-smoke">
              <span className="text-volt">{pad(index + 1)}</span> / {pad(items.length)}
            </p>
            <button ref={closeRef} onClick={onClose} aria-label="Close viewer" className="grid size-11 place-items-center rounded-full border border-white/15 hover:border-volt hover:text-volt">
              <X className="size-5" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2 sm:px-20">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={item.id}
                className="relative h-full max-h-[78vh] w-full max-w-6xl touch-pan-y"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                drag={item.kind === "video" ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80 || info.velocity.x < -400) go(1);
                  else if (info.offset.x > 80 || info.velocity.x > 400) go(-1);
                }}
              >
                {item.kind === "video" && item.videoUrl ? (
                  <video key={item.videoUrl} className="size-full rounded-[var(--radius-card)] object-contain" controls autoPlay playsInline poster={item.src}>
                    <source src={item.videoUrl} />
                    Your browser does not support embedded video.
                  </video>
                ) : (
                  <Photo src={item.src} alt={item.title} fill sizes="100vw" className="pointer-events-none select-none object-contain" draggable={false} />
                )}
              </motion.div>
            </AnimatePresence>

            <button onClick={() => go(-1)} aria-label="Previous image" className="absolute left-4 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink/50 hover:border-volt hover:text-volt sm:grid">
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={() => go(1)} aria-label="Next image" className="absolute right-4 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-ink/50 hover:border-volt hover:text-volt sm:grid">
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="p-4 text-center sm:p-6">
            <p className="display text-2xl">{item.title}</p>
            <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-smoke">
              {item.category} <span className="sm:hidden">· swipe to browse</span>
              <span className="hidden sm:inline">· ← → to browse · esc to close</span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function PlayBadge() {
  return (
    <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-volt/90 text-ink shadow-2xl">
      <Play className="ml-1 size-6" fill="currentColor" />
    </span>
  );
}
