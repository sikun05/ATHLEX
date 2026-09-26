import { Photo } from "@/components/ui/photo";
import { Reveal, SplitWords } from "@/components/motion/reveal";
import type { ReactNode } from "react";

/** Compact cinematic header for inner pages. */
export function PageHero({ eyebrow, title, children, image }: { eyebrow: string; title: string; children?: ReactNode; image?: string }) {
  return (
    <section className="relative flex min-h-[62vh] items-end overflow-hidden pb-16 pt-40 sm:min-h-[70vh] sm:pb-20">
      {image && (
        <>
          <Photo src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" aria-hidden />
        </>
      )}
      <div className="pointer-events-none absolute -right-40 top-10 size-[40rem] animate-gradient-drift rounded-full bg-[radial-gradient(circle,rgba(200,255,46,0.12),transparent_60%)]" aria-hidden />
      <div className="container-x relative">
        <Reveal className="flex items-center gap-3">
          <span className="h-px w-10 bg-volt" aria-hidden />
          <span className="eyebrow">{eyebrow}</span>
        </Reveal>
        <SplitWords as="h1" text={title} animateOnMount delay={0.15} className="display mt-6 max-w-[16ch] text-[clamp(3.2rem,10vw,9rem)]" />
        {children && (
          <Reveal delay={0.4} className="mt-6 max-w-xl text-base text-bone/70 sm:text-lg">
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
}
