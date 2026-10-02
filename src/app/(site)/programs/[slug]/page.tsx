import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, Clock, Flame, Gauge } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { getProgram, programs } from "@/lib/content";
import { pageMetadata, JsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return programs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/programs/[slug]">): Promise<Metadata> {
  const p = getProgram((await params).slug);
  if (!p) return {};
  return pageMetadata({ title: `${p.name} Program`, description: `${p.short} ${p.description}`.slice(0, 160), path: `/programs/${p.slug}`, image: p.image });
}

export default async function ProgramPage({ params }: PageProps<"/programs/[slug]">) {
  const p = getProgram((await params).slug);
  if (!p) notFound();
  const others = programs.filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `${p.name} at ${site.name}`,
          description: p.description,
          provider: { "@id": `${site.url}/#gym` },
          areaServed: site.address.city,
        }}
      />
      <PageHero eyebrow="Program" title={p.name} image={p.image}>
        {p.short}
      </PageHero>
      <section className="section-y pt-4">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="text-xl leading-relaxed text-bone/85">{p.description}</p>
            <h2 className="display mt-14 text-h3">What you&apos;ll achieve</h2>
            <ul className="mt-6 space-y-4">
              {p.outcomes.map((o) => (
                <li key={o} className="flex items-center gap-4 text-lg">
                  <span className="grid size-7 place-items-center rounded-full bg-volt text-ink">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  {o}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal direction="left" className="lg:col-span-5">
            <div className="sticky top-28 rounded-[var(--radius-card)] border border-white/[0.08] bg-graphite p-8">
              <dl className="grid grid-cols-3 gap-4 border-b border-white/[0.08] pb-8">
                <Meta icon={<Gauge className="size-4" />} label="Level" value={p.level} />
                <Meta icon={<Clock className="size-4" />} label="Session" value={p.duration} />
                <Meta
                  icon={<Flame className="size-4" />}
                  label="Intensity"
                  value={
                    <span className="flex" aria-label={`${p.intensity} of 5`}>
                      {Array.from({ length: 5 }, (_, k) => (
                        <Flame key={k} className={cn("size-3.5", k < p.intensity ? "text-volt" : "text-white/20")} aria-hidden />
                      ))}
                    </span>
                  }
                />
              </dl>
              <p className="mt-8 text-sm text-smoke">Included with Standard plans and above. Try a session free before you commit.</p>
              <div className="mt-6 flex flex-col gap-3">
                <ButtonLink href={`/free-trial?interest=${encodeURIComponent(p.name)}`} arrow>
                  Book free trial
                </ButtonLink>
                <ButtonLink href="/membership" variant="outline">
                  See membership plans
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      <section className="border-t border-white/[0.06] py-16" aria-label="Other programs">
        <div className="container-x">
          <h2 className="eyebrow mb-6">Explore more</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/programs/${o.slug}`} className="group flex items-center justify-between rounded-[var(--radius-card)] border border-white/[0.08] p-6 transition hover:border-volt">
                  <span className="display text-3xl">{o.name}</span>
                  <span className="text-volt transition group-hover:translate-x-1">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-smoke">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 font-semibold">{value}</dd>
    </div>
  );
}
