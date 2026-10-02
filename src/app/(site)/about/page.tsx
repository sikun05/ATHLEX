import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { About } from "@/components/sections/about";
import { Facilities } from "@/components/sections/facilities";
import { Trainers } from "@/components/sections/trainers";
import { MarqueeBand } from "@/components/sections/marquee-band";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { facilities, faqs } from "@/lib/content";
import { getTrainers } from "@/lib/data";
import { media } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: "ATHLEX is a coach-led strength & performance club in Bengaluru. Meet the team, explore our facilities and discover what makes us different.",
  path: "/about",
  image: media.about,
});

const values = [
  ["Coaching first", "Every member gets an assessment, a plan and a coach who knows their name — and their numbers."],
  ["Earned, not given", "We celebrate consistency over quick fixes. Progress is built one session at a time."],
  ["Premium, not pretentious", "World-class equipment and zero ego. Everyone belongs on the floor."],
  ["Recovery matters", "Mobility, sleep and nutrition are part of the program — not an afterthought."],
];

export default async function AboutPage() {
  const trainers = await getTrainers();
  return (
    <>
      <PageHero eyebrow="About ATHLEX" title="Built by coaches. For people who show up." image={media.aboutDetail}>
        Since 2020 we&apos;ve helped hundreds of members get stronger, leaner and more confident — with coaching that actually works.
      </PageHero>
      <About />
      <MarqueeBand />
      <section className="section-y" aria-labelledby="values-title">
        <div className="container-x">
          <Reveal>
            <h2 id="values-title" className="display text-h2">
              What we stand for
            </h2>
          </Reveal>
          <Stagger as="ol" className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-white/[0.06] bg-white/[0.06] md:grid-cols-2">
            {values.map(([t, d], i) => (
              <StaggerItem as="li" key={t} className="bg-ink p-8 sm:p-10">
                <span className="font-mono text-xs text-volt">0{i + 1}</span>
                <h3 className="display mt-4 text-h3">{t}</h3>
                <p className="mt-3 max-w-md text-smoke">{d}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
      <Facilities items={facilities} />
      <Trainers trainers={trainers} limit={3} />
      <section className="section-y bg-coal" aria-labelledby="faq-title">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <h2 id="faq-title" className="display text-h2 lg:col-span-4">
            FAQ
          </h2>
          <div className="divide-y divide-white/[0.08] lg:col-span-8">
            {faqs.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold">
                  {f.q}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/15 transition group-open:rotate-45 group-open:border-volt group-open:text-volt" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl text-smoke">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
