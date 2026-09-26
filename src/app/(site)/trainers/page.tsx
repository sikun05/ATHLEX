import type { Metadata } from "next";
import { Award } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { getTrainers } from "@/lib/data";
import { media } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Trainers & Coaches",
  description: "Meet the certified ATHLEX coaching team — strength, hypertrophy, HIIT, boxing, functional training, mobility and yoga specialists.",
  path: "/trainers",
  image: media.trainers.arjun,
});

export const revalidate = 300;

export default async function TrainersPage() {
  const trainers = await getTrainers();
  return (
    <>
      <PageHero eyebrow="The coaches" title="Experts in your corner." image={media.aboutDetail}>
        Every ATHLEX coach is certified, continuously educated and obsessed with helping you progress safely.
      </PageHero>
      <section className="pb-24" aria-label="Trainer profiles">
        <div className="container-x space-y-6">
          {trainers.map((t, i) => (
            <Reveal key={t.id}>
              <article id={t.slug} className="grid scroll-mt-28 overflow-hidden rounded-[var(--radius-card)] border border-white/[0.08] bg-graphite/60 md:grid-cols-12">
                <div className={`relative aspect-[4/5] md:col-span-5 md:aspect-auto md:min-h-[30rem] ${i % 2 ? "md:order-2" : ""}`}>
                  <Photo src={t.image} alt={`${t.name}, ${t.position}`} fill sizes="(min-width:768px) 42vw, 100vw" className="object-cover" />
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-12 md:col-span-7">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-volt">
                    {t.position} · {t.experienceYears} years
                  </p>
                  <h2 className="display mt-3 text-5xl sm:text-7xl">{t.name}</h2>
                  <p className="mt-2 text-lg text-bone/80">{t.specialization}</p>
                  <p className="mt-6 max-w-xl leading-relaxed text-smoke">{t.bio}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {t.certifications.map((c) => (
                      <li key={c} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs">
                        <Award className="size-3 text-volt" aria-hidden /> {c}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <ButtonLink href={`/free-trial?interest=${encodeURIComponent("Personal Training")}`} arrow>
                      Book a session
                    </ButtonLink>
                    <ButtonLink href="/schedule" variant="outline">
                      See classes
                    </ButtonLink>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
