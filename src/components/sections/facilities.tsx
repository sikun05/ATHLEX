import { Activity, Dumbbell, GlassWater, HeartPulse, Lock, ShowerHead, Sparkles, SquareParking, UserCheck, type LucideIcon } from "lucide-react";
import type { Facility } from "@/lib/types";
import { Photo } from "@/components/ui/photo";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = { Dumbbell, HeartPulse, Activity, Lock, ShowerHead, UserCheck, Sparkles, SquareParking, GlassWater };

export function Facilities({ items }: { items: Facility[] }) {
  return (
    <section aria-label="Facilities" className="section-y">
      <div className="container-x">
        <SectionHeading index="07" eyebrow="Facilities" title="Built for serious training." className="mb-14">
          12,000 sq ft of premium equipment, recovery tech and member comforts.
        </SectionHeading>
        <Stagger as="ul" className="grid auto-rows-[15rem] gap-3 sm:grid-cols-2 lg:auto-rows-[18rem] lg:grid-cols-4">
          {items.map((f, i) => {
            const Icon = ICONS[f.icon] ?? Dumbbell;
            const feature = i === 0 || i === 5;
            return (
              <StaggerItem as="li" key={f.slug} className={cn(feature && "sm:col-span-2 lg:row-span-2")}>
                <article className="group relative size-full overflow-hidden rounded-[var(--radius-card)] bg-graphite" data-cursor="view" tabIndex={0}>
                  <Photo src={f.image} alt={f.name} fill sizes={feature ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"} className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent transition-colors duration-500 group-hover:via-ink/70" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <span className="mb-4 grid size-10 place-items-center rounded-full bg-volt/15 text-volt backdrop-blur transition group-hover:bg-volt group-hover:text-ink">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <h3 className={cn("display", feature ? "text-h3" : "text-2xl sm:text-3xl")}>{f.name}</h3>
                    <div className="grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-expo)] [@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:grid-rows-[1fr] [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus:grid-rows-[1fr] [@media(hover:hover)]:group-focus:opacity-100">
                      <p className="overflow-hidden pt-2 text-sm text-bone/75">{f.description}</p>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
