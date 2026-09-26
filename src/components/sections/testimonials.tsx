"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { Photo } from "@/components/ui/photo";
import { Marquee } from "@/components/ui/marquee";
import { cn, pad } from "@/lib/utils";

export function Testimonials({ items }: { items: Testimonial[] }) {
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const t = items[index];

  const go = useCallback((d: number) => setState(([i]) => [(i + d + items.length) % items.length, d]), [items.length]);

  useEffect(() => {
    if (paused || reduce) return;
    const id = setInterval(() => go(1), 7000);
    return () => clearInterval(id);
  }, [paused, reduce, go]);

  if (!t) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Member testimonials"
      className="section-y relative overflow-hidden bg-coal"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Ambient background motion */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-6 opacity-[0.05]" aria-hidden>
        <Marquee items={["Results", "Community", "Coaching", "Discipline"]} duration={70} itemClassName="display text-[12rem] leading-none" />
        <Marquee items={["Stronger", "Fitter", "Faster", "Healthier"]} duration={80} reverse itemClassName="display text-[12rem] leading-none" />
      </div>

      <div className="container-x relative">
        <div className="mb-12 flex items-center gap-3">
          <span className="font-mono text-xs text-smoke">09</span>
          <span className="h-px w-8 bg-volt" aria-hidden />
          <h2 className="eyebrow">Member stories</h2>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="relative min-h-[22rem] lg:col-span-9 sm:min-h-[18rem]">
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.figure
                key={t.id}
                custom={dir}
                variants={{
                  enter: (d: number) => ({ x: d * 120, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: d * -120, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.3}
                onDragEnd={(_, info) => (info.offset.x < -60 ? go(1) : info.offset.x > 60 ? go(-1) : null)}
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${items.length}`}
                className="touch-pan-y"
              >
                <div className="flex gap-1" aria-label={`Rated ${t.rating} out of 5`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={cn("size-4", i < t.rating ? "fill-volt text-volt" : "text-white/20")} aria-hidden />
                  ))}
                </div>
                <blockquote className="mt-6 text-2xl font-medium leading-snug tracking-tight sm:text-3xl lg:text-[2.6rem] lg:leading-[1.15]">
                  <span className="text-volt">“</span>
                  {t.review}
                  <span className="text-volt">”</span>
                </blockquote>
                <figcaption className="mt-10 flex items-center gap-4">
                  <span className="relative size-14 overflow-hidden rounded-full border-2 border-volt">
                    <Photo src={t.image} alt={t.name} fill sizes="56px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block font-semibold">{t.name}</span>
                    <span className="block text-sm text-smoke">
                      Member since {t.memberSince} · <span className="text-volt">{t.transformation}</span>
                    </span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-6 lg:col-span-3 lg:flex-col lg:items-end">
            <p className="display text-6xl sm:text-7xl tabular-nums">
              {pad(index + 1)}
              <span className="text-2xl text-ash">/{pad(items.length)}</span>
            </p>
            <div className="flex gap-2">
              <button onClick={() => go(-1)} aria-label="Previous testimonial" className="grid size-14 place-items-center rounded-full border border-white/15 transition hover:border-volt hover:text-volt">
                <ChevronLeft className="size-5" />
              </button>
              <button onClick={() => go(1)} aria-label="Next testimonial" className="grid size-14 place-items-center rounded-full bg-volt text-ink transition hover:bg-volt-soft">
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-2" role="tablist" aria-label="Choose testimonial">
          {items.map((it, i) => (
            <button
              key={it.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`Show testimonial from ${it.name}`}
              onClick={() => setState([i, i > index ? 1 : -1])}
              className="relative h-6 flex-1"
            >
              <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/10">
                {i === index && (
                  <motion.span
                    key={`${index}-${paused}`}
                    className="absolute inset-0 origin-left bg-volt"
                    initial={{ scaleX: reduce || paused ? 1 : 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: reduce || paused ? 0 : 7, ease: "linear" }}
                  />
                )}
                {i < index && <span className="absolute inset-0 bg-white/30" />}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
