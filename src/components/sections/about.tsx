import { media } from "@/lib/media";
import { stats } from "@/lib/content";
import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { ClipReveal, Counter, Parallax, Reveal, SplitWords } from "@/components/motion/reveal";

export function About({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  return (
    <section aria-labelledby="about-title" className="section-y relative overflow-hidden">
      <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="relative lg:col-span-6">
          <ClipReveal className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)]">
            <Parallax className="absolute inset-0" offset={60}>
              <Photo src={media.about} alt="Inside the ATHLEX strength floor" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" data-cursor="view" />
            </Parallax>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" aria-hidden />
          </ClipReveal>
          <Reveal direction="left" delay={0.3} className="absolute -bottom-8 right-4 w-40 sm:-right-6 sm:w-56 lg:-right-10">
            <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] border-4 border-ink shadow-2xl">
              <Photo src={media.aboutDetail} alt="Coach guiding a member" fill sizes="224px" className="object-cover" />
            </div>
          </Reveal>
          <div className="absolute left-4 top-4 rounded-full bg-ink/70 px-4 py-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-volt backdrop-blur">
            Est. 2020 · Bengaluru
          </div>
        </div>

        <div className="lg:col-span-6">
          <Reveal className="flex items-center gap-3">
            <span className="font-mono text-xs text-smoke">01</span>
            <span className="h-px w-8 bg-volt" aria-hidden />
            <span className="eyebrow">More than a gym</span>
          </Reveal>
          <SplitWords as={headingLevel} id="about-title" text="This is where transformation begins." className="display mt-6 text-5xl sm:text-6xl xl:text-7xl" highlight={[3]} />
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
                <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-smoke">{s.label}</dt>
                <dd className="display mt-2 text-5xl sm:text-6xl">
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
