"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { media } from "@/lib/media";
import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { usePreloaded } from "@/components/layout/preloader";

const EASE = [0.16, 1, 0.3, 1] as const;
const WORDS = ["Build", "your", "strongest", "self."];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const ready = usePreloaded();
  const reduce = useReducedMotion();
  const videoUrl = process.env.NEXT_PUBLIC_HERO_VIDEO_URL;

  // Scroll parallax
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Pointer parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(useTransform(mx, [-1, 1], [18, -18]), { stiffness: 60, damping: 20 });
  const py = useSpring(useTransform(my, [-1, 1], [12, -12]), { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  return (
    <section ref={ref} aria-label="Introduction" className="relative flex min-h-[max(100svh,640px)] items-end overflow-hidden bg-ink">
      {/* Background media */}
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { y: bgY }}
        initial={{ opacity: 0, scale: 1.12 }}
        animate={ready ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 1.8, ease: EASE }}
      >
        <motion.div className="absolute -inset-8" style={reduce ? undefined : { x: px, y: py }}>
          {videoUrl ? (
            <video className="size-full object-cover" autoPlay muted loop playsInline preload="metadata" poster={media.hero} aria-hidden>
              <source src={videoUrl} />
            </video>
          ) : (
            <Photo src={media.hero} alt="Athlete training on the ATHLEX strength floor" fill priority sizes="100vw" quality={75} className="object-cover object-center" />
          )}
        </motion.div>
      </motion.div>

      {/* Overlays: dark wash, moving volt gradient, vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-transparent to-transparent" aria-hidden />
      <div className="pointer-events-none absolute -left-1/4 top-1/4 size-[70vmax] animate-gradient-drift rounded-full bg-[radial-gradient(circle,rgba(200,255,46,0.16),transparent_60%)] mix-blend-screen" aria-hidden />
      <div className="absolute inset-0 shadow-[inset_0_0_200px_60px_rgba(0,0,0,0.8)]" aria-hidden />

      {/* Content */}
      <motion.div style={reduce ? undefined : { y: contentY, opacity: fade }} className="container-x relative z-10 pb-24 pt-[calc(var(--header-h)+2rem)] sm:pb-28 lg:pb-32">
        <motion.p
          className="eyebrow mb-6 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={ready ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        >
          <span className="h-px w-10 bg-volt" aria-hidden />
          Train hard. Live strong.
        </motion.p>

        <h1 className="display text-hero" aria-label="Build your strongest self.">
          {WORDS.map((w, i) => (
            <span key={w} aria-hidden className="block overflow-hidden pb-[0.04em] sm:inline-block sm:pr-[0.18em]">
              <motion.span
                className={`inline-block ${w === "strongest" ? "text-volt" : ""}`}
                initial={{ y: "100%", opacity: 0 }}
                animate={ready ? { y: "0%", opacity: 1 } : undefined}
                transition={{ duration: 1.1, delay: 0.2 + i * 0.12, ease: EASE }}
              >
                {w}
              </motion.span>
              {i === 1 && <br className="hidden lg:block" />}
            </span>
          ))}
        </h1>

        <motion.div
          className="mt-8 flex max-w-3xl flex-col gap-8 sm:mt-10 lg:flex-row lg:items-end lg:justify-between"
          initial={{ opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.75, ease: EASE }}
        >
          <p className="max-w-md text-base leading-relaxed text-bone/75 sm:text-lg">
            Elite coaching, world-class equipment and a community that shows up. Your transformation starts on day one.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 flex flex-col gap-3 xs:flex-row sm:mt-10"
          initial={{ opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
        >
          <Magnetic>
            <ButtonLink href="/membership" size="lg" arrow className="w-full xs:w-auto">
              Join now
            </ButtonLink>
          </Magnetic>
          <Magnetic>
            <ButtonLink href="/free-trial" size="lg" variant="outline" className="w-full backdrop-blur-sm xs:w-auto">
              Book free trial
            </ButtonLink>
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.a
        href="#marquee"
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-smoke sm:flex lg:bottom-8 lg:left-auto lg:right-16 lg:translate-x-0"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <span className="font-mono text-[0.7rem] tracking-[0.3em]">SCROLL TO EXPLORE ↓</span>
        <span className="relative h-12 w-px overflow-hidden bg-white/15" aria-hidden>
          <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-dot bg-volt" />
        </span>
      </motion.a>

      {/* Side meta (desktop) */}
      <motion.ul
        aria-label="Highlights"
        className="absolute right-16 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-6 text-right xl:flex"
        initial={{ opacity: 0, x: 20 }}
        animate={ready ? { opacity: 1, x: 0 } : undefined}
        transition={{ delay: 1.1, duration: 0.9, ease: EASE }}
      >
        {[
          ["4.9★", "Google rating"],
          ["24/7", "Member app"],
          ["12,000", "sq ft floor"],
        ].map(([v, l]) => (
          <li key={l}>
            <p className="display text-4xl">{v}</p>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-smoke">{l}</p>
          </li>
        ))}
      </motion.ul>
    </section>
  );
}
