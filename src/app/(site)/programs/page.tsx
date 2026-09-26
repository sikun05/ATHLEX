import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Flame } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Photo } from "@/components/ui/photo";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { programs } from "@/lib/content";
import { media } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";
import { cn, pad } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Training Programs",
  description: "Strength, hypertrophy, weight loss, HIIT, functional, cross training, mobility, sports conditioning and 1:1 personal training at ATHLEX.",
  path: "/programs",
  image: media.programs.strength,
});

export default function ProgramsPage() {
  return (
    <>
      <PageHero eyebrow="Programs" title="Every goal. One standard." image={media.programs.hiit}>
        Nine coach-designed programs, each with structured progressions, clear outcomes and tracking built into your member dashboard.
      </PageHero>
      <section className="section-y pt-0" aria-label="All programs">
        <Stagger as="ul" className="container-x grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {programs.map((p, i) => (
            <StaggerItem as="li" key={p.slug}>
              <Link href={`/programs/${p.slug}`} data-cursor="view" className="group relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-graphite">
                <Photo src={p.image} alt={`${p.name} program`} fill sizes="(min-width:1280px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" aria-hidden />
                <span className="absolute left-5 top-5 font-mono text-xs text-bone/70">{pad(i + 1)}</span>
                <span className="absolute right-5 top-5 grid size-11 place-items-center rounded-full border border-white/20 transition duration-500 group-hover:rotate-45 group-hover:border-volt group-hover:bg-volt group-hover:text-ink">
                  <ArrowUpRight className="size-4" />
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-volt">
                    {p.level} · {p.duration}
                    <span className="flex" aria-label={`Intensity ${p.intensity} of 5`}>
                      {Array.from({ length: 5 }, (_, k) => (
                        <Flame key={k} className={cn("size-3", k < p.intensity ? "text-volt" : "text-white/20")} aria-hidden />
                      ))}
                    </span>
                  </p>
                  <h2 className="display mt-3 text-5xl">{p.name}</h2>
                  <p className="mt-2 text-sm text-bone/70">{p.short}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
