"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { media } from "@/lib/media";
import { Photo } from "@/components/ui/photo";
import { ClipReveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const tiles = [
  { src: media.aboutCollage[0], alt: "Coach spotting a member on the bench press", aspect: "aspect-[3/4]" },
  { src: media.aboutCollage[1], alt: "Battle-rope conditioning session", aspect: "aspect-[4/3]" },
  { src: media.aboutCollage[2], alt: "The ATHLEX training floor", aspect: "aspect-[4/3]" },
  { src: media.aboutCollage[3], alt: "Dumbbell rack on the strength floor", aspect: "aspect-[3/4]" },
];

/** Four-photo staggered collage: clip-wipe reveal, slow Ken Burns zoom, columns drift in opposite directions on scroll. */
export function AboutCollage() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const up = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const down = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <div ref={ref} className="relative grid grid-cols-2 gap-3 sm:gap-4">
      <motion.div style={reduce ? undefined : { y: up }} className="flex flex-col gap-3 sm:gap-4">
        <Tile i={0} delay={0} />
        <Tile i={1} delay={0.15} />
      </motion.div>
      <motion.div style={reduce ? undefined : { y: down }} className="mt-10 flex flex-col gap-3 sm:mt-16 sm:gap-4">
        <Tile i={2} delay={0.1} />
        <Tile i={3} delay={0.25} />
      </motion.div>
      <div className="absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-volt backdrop-blur sm:left-4 sm:top-4 sm:px-4 sm:py-2">
        Est. 2020 · Bengaluru
      </div>
    </div>
  );
}

function Tile({ i, delay }: { i: number; delay: number }) {
  return (
    <ClipReveal delay={delay} className={cn("group relative overflow-hidden rounded-[var(--radius-card)] bg-graphite", tiles[i].aspect)}>
      <div className="absolute inset-0 animate-kenburns" style={{ animationDelay: `${-i * 3.5}s` }}>
        <Photo
          src={tiles[i].src}
          alt={tiles[i].alt}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" aria-hidden />
    </ClipReveal>
  );
}
