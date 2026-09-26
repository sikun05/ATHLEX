import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Trainer } from "@/lib/types";
import { Photo } from "@/components/ui/photo";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { InstagramIcon, XIcon, YoutubeIcon } from "@/components/ui/social-icons";

export function Trainers({ trainers, limit, showCta = true, headingLevel = "h2" }: { trainers: Trainer[]; limit?: number; showCta?: boolean; headingLevel?: "h1" | "h2" }) {
  const list = limit ? trainers.slice(0, limit) : trainers;
  return (
    <section aria-label="Trainers" className="section-y">
      <div className="container-x">
        <div className="mb-14 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading as={headingLevel} index="03" eyebrow="The coaches" title="Coached by the best.">
            Certified specialists with decades of combined experience — and the energy to get you there.
          </SectionHeading>
          {showCta && (
            <ButtonLink href="/trainers" variant="outline" arrow className="self-start lg:self-end">
              View all trainers
            </ButtonLink>
          )}
        </div>

        <Stagger as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <StaggerItem as="li" key={t.id}>
              <TrainerCard trainer={t} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function TrainerCard({ trainer: t }: { trainer: Trainer }) {
  const socials = [
    t.social.instagram && { href: t.social.instagram, label: "Instagram", Icon: InstagramIcon },
    t.social.youtube && { href: t.social.youtube, label: "YouTube", Icon: YoutubeIcon },
    t.social.x && { href: t.social.x, label: "X", Icon: XIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof InstagramIcon }[];

  return (
    <article className="group relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-graphite" data-cursor="view">
      <Photo
        src={t.image}
        alt={`${t.name}, ${t.position} at ATHLEX`}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover grayscale-[35%] transition-[transform,filter] duration-[1.2s] ease-[var(--ease-expo)] group-hover:scale-105 group-hover:grayscale-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" aria-hidden />
      <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/55 group-focus-within:bg-ink/55" aria-hidden />

      <div className="absolute left-5 top-5">
        <span className="rounded-full bg-ink/60 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-volt backdrop-blur">{t.experienceYears} yrs exp.</span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-volt">{t.position}</p>
        <h3 className="display mt-2 text-4xl">{t.name}</h3>
        <p className="mt-1 text-sm text-bone/70">{t.specialization}</p>

        {/* Details reveal on hover (desktop) — always visible on touch */}
        <div className="grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-expo)] [@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:grid-rows-[1fr] [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:grid-rows-[1fr] [@media(hover:hover)]:group-hover:opacity-100">
          <div className="overflow-hidden">
            <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-smoke">{t.bio}</p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <Link
                href={`/trainers#${t.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-volt px-4 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink transition hover:bg-volt-soft"
              >
                Train with {t.name.split(" ")[0]} <ArrowUpRight className="size-3.5" />
              </Link>
              <ul className="flex gap-1.5">
                {socials.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t.name} on ${label}`}
                      className="grid size-9 place-items-center rounded-full border border-white/15 text-bone/80 transition hover:border-volt hover:text-volt"
                    >
                      <Icon className="size-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
