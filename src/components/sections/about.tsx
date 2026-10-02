import { stats } from "@/lib/content";
import { AboutCollage } from "./about-collage";
import { ButtonLink } from "@/components/ui/button";
import { Counter, Reveal, SplitWords } from "@/components/motion/reveal";

export function About({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  return (
    <section aria-labelledby="about-title" className="section-y relative overflow-hidden">
      <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-6">
          <AboutCollage />
        </div>

        <div className="lg:col-span-6">
          <Reveal className="flex items-center gap-3">
            <span className="font-mono text-xs text-smoke">01</span>
            <span className="h-px w-8 bg-volt" aria-hidden />
            <span className="eyebrow">More than a gym</span>
          </Reveal>
          <SplitWords as={headingLevel} id="about-title" text="This is where transformation begins." className="display mt-6 text-h2" highlight={[3]} />
          <Reveal delay={0.1} className="mt-8 space-y-5 text-base leading-relaxed text-smoke sm:text-lg">
            <p>
              ATHLEX was built by coaches who were tired of crowded, uninspiring gyms. Every square foot — from the calibrated platforms to the recovery lounge — is designed to help
              you train with intent.
            </p>
            <p>Structured programs, real accountability and a community that pushes you further than you&apos;d go alone.</p>
          </Reveal>

          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-white/[0.06] bg-white/[0.06]">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={0.1 + i * 0.08} className="bg-ink p-6 sm:p-8">
                <dt className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-smoke">{s.label}</dt>
                <dd className="display mt-2 text-stat">
                  <Counter to={s.value} suffix={s.suffix} />
                </dd>
              </Reveal>
            ))}
          </dl>

          <Reveal delay={0.2} className="mt-10">
            <ButtonLink href="/about" variant="outline" arrow>
              Our story
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
