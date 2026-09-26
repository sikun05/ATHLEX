"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Program } from "@/lib/types";
import { Photo } from "@/components/ui/photo";
import { SectionHeading } from "@/components/ui/section-heading";
import { useMediaQuery } from "@/lib/hooks";
import { cn, pad } from "@/lib/utils";

export function Programs({ programs }: { programs: Program[] }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduce = useReducedMotion();
  const pinned = isDesktop && !reduce;

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    if (!pinned || !trackRef.current) return;
    const el = trackRef.current;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth + 64));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned, programs.length]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useSpring(useTransform(scrollYProgress, [0, 1], [0, -distance]), { stiffness: 140, damping: 30, mass: 0.4 });
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="programs-title"
      className="relative bg-coal"
      style={pinned ? { height: `calc(100vh + ${distance}px)` } : undefined}
    >
      <div className={cn(pinned ? "sticky top-0 flex h-screen flex-col justify-center overflow-hidden" : "section-y")}>
        <div className="container-x mb-10 flex flex-col justify-between gap-8 lg:mb-14 lg:flex-row lg:items-end">
          <SectionHeading index="02" eyebrow="Programs" title="Train with purpose." />
          <div className="flex items-center gap-6">
            <p className="max-w-xs text-sm text-smoke">Nine coach-built programs for every goal and level. {pinned ? "Scroll to explore." : "Swipe to explore."}</p>
            <Link href="/programs" className="shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-volt hover:underline">
              View all
            </Link>
          </div>
        </div>
        <span id="programs-title" className="sr-only">
          Our training programs
        </span>

        <motion.div
          ref={trackRef}
          style={pinned ? { x } : undefined}
          className={cn(
            "flex gap-4 px-5 md:px-10 xl:px-16",
            !pinned && "no-scrollbar snap-x snap-mandatory overflow-x-auto scroll-px-5 pb-4 md:scroll-px-10",
          )}
          role="list"
        >
          {programs.map((p, i) => (
            <ProgramCard key={p.slug} program={p} index={i} />
          ))}
        </motion.div>

        {pinned && (
          <div className="container-x mt-10">
            <div className="h-px w-full bg-white/10">
              <motion.div className="h-px bg-volt" style={{ width: progress }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ProgramCard({ program, index }: { program: Program; index: number }) {
  return (
    <Link
      role="listitem"
      href={`/programs/${program.slug}`}
      data-cursor="view"
      className="group relative flex h-[26rem] w-[78vw] max-w-[22rem] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-[var(--radius-card)] border border-white/[0.06] bg-graphite transition-[width,max-width] duration-700 ease-[var(--ease-expo)] sm:h-[30rem] sm:w-[22rem] lg:h-[62vh] lg:max-h-[36rem] lg:w-[24rem] lg:max-w-none lg:hover:w-[28rem]"
    >
      <Photo
        src={program.image}
        alt={`${program.name} at ATHLEX`}
        fill
        sizes="(min-width: 1024px) 28rem, 80vw"
        className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10 transition-opacity duration-500 group-hover:opacity-90" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-volt/25 via-transparent to-transparent opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100" aria-hidden />

      <div className="absolute left-5 right-5 top-5 flex items-start justify-between">
        <span className="font-mono text-xs text-bone/70">{pad(index + 1)}</span>
        <span className="grid size-11 place-items-center rounded-full border border-white/20 bg-ink/30 backdrop-blur transition-all duration-500 ease-[var(--ease-expo)] group-hover:rotate-45 group-hover:border-volt group-hover:bg-volt group-hover:text-ink">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <div className="relative p-6 transition-transform duration-500 ease-[var(--ease-expo)] lg:translate-y-14 lg:group-hover:translate-y-0">
        <p className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-volt">
          {program.level} · {program.duration}
        </p>
        <h3 className="display text-4xl sm:text-5xl">{program.name}</h3>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-bone/70 transition-opacity duration-500 lg:opacity-0 lg:group-hover:opacity-100">{program.short}</p>
      </div>
    </Link>
  );
}
