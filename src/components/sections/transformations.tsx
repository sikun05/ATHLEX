"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { MoveHorizontal, Quote } from "lucide-react";
import type { Transformation } from "@/lib/types";
import { Photo } from "@/components/ui/photo";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";

export function Transformations({ items, headingLevel = "h2" }: { items: Transformation[]; headingLevel?: "h1" | "h2" }) {
  return (
    <section aria-label="Member transformations" className="section-y overflow-hidden bg-coal">
      <div className="container-x">
        <SectionHeading as={headingLevel} index="06" eyebrow="Real results" title="Before. After. Proof." className="mb-16">
          No filters, no shortcuts — just members who trusted the process. Drag the slider to compare.
        </SectionHeading>

        <div className="space-y-20 lg:space-y-28">
          {items.map((t, i) => (
            <article key={t.id} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
              <div className={i % 2 ? "lg:order-2 lg:col-span-7" : "lg:col-span-7"}>
                <BeforeAfter before={t.before} after={t.after} label={t.name} />
              </div>
              <Reveal direction={i % 2 ? "right" : "left"} className="lg:col-span-5">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-volt">
                  {t.program} · {t.duration}
                </p>
                <h3 className="display mt-4 text-5xl sm:text-6xl">{t.name}</h3>
                <p className="display mt-3 text-3xl text-outline sm:text-4xl">{t.result}</p>
                <blockquote className="mt-8 border-l-2 border-volt pl-5">
                  <Quote className="mb-3 size-5 text-volt" aria-hidden />
                  <p className="text-lg leading-relaxed text-bone/85">{t.quote}</p>
                </blockquote>
                <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-[var(--radius-card)] border border-white/[0.06] p-4">
                    <dt className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-smoke">Duration</dt>
                    <dd className="mt-1 font-semibold">{t.duration}</dd>
                  </div>
                  <div className="rounded-[var(--radius-card)] border border-white/[0.06] p-4">
                    <dt className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-smoke">Program</dt>
                    <dd className="mt-1 font-semibold">{t.program}</dd>
                  </div>
                </dl>
              </Reveal>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BeforeAfter({ before, after, label }: { before: string; after: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const touched = useRef(false);

  // Intro sweep when the slider scrolls into view
  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(50, [50, 18, 82, 50], {
      duration: 2.2,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => !touched.current && setPos(v),
    });
    return () => controls.stop();
  }, [inView, reduce]);

  const setFromClientX = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      ref={ref}
      className="relative aspect-[4/3] touch-pan-y select-none overflow-hidden rounded-[var(--radius-card)] bg-graphite"
      onPointerDown={(e) => {
        touched.current = true;
        setDragging(true);
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => dragging && setFromClientX(e.clientX)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <Photo src={after} alt={`${label} after`} fill sizes="(min-width: 1024px) 58vw, 100vw" className="pointer-events-none object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Photo src={before} alt={`${label} before`} fill sizes="(min-width: 1024px) 58vw, 100vw" className="pointer-events-none object-cover grayscale" draggable={false} />
      </div>

      <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] backdrop-blur">Before</span>
      <span className="absolute right-4 top-4 rounded-full bg-volt px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink">After</span>

      <div className="absolute inset-y-0 w-0.5 bg-volt shadow-[0_0_20px_rgba(200,255,46,0.6)]" style={{ left: `${pos}%` }} aria-hidden />
      <div
        role="slider"
        tabIndex={0}
        aria-label={`Compare before and after for ${label}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={(e) => {
          touched.current = true;
          if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 5));
          if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 5));
          if (e.key === "Home") setPos(0);
          if (e.key === "End") setPos(100);
        }}
        className="absolute top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-volt text-ink shadow-2xl transition-transform active:scale-90"
        style={{ left: `${pos}%` }}
      >
        <MoveHorizontal className="size-5" />
      </div>
    </div>
  );
}
