import { Marquee } from "@/components/ui/marquee";

export function MarqueeBand() {
  return (
    <section id="marquee" aria-label="Our values" className="relative overflow-hidden border-y border-white/[0.06] bg-ink py-8 sm:py-10">
      <Marquee
        items={["Strength", "Discipline", "Performance", "Consistency", "Results"]}
        duration={32}
        itemClassName="display text-5xl sm:text-7xl lg:text-8xl"
      />
      <div className="mt-3 -rotate-[0.6deg] bg-volt py-3 text-ink sm:mt-4">
        <Marquee
          reverse
          duration={38}
          separator="✦"
          items={["No excuses", "Coached by experts", "Train with purpose", "Recover smarter", "Show up daily"]}
          itemClassName="font-mono text-sm font-medium uppercase tracking-[0.25em] [&>span:last-child]:text-ink"
        />
      </div>
    </section>
  );
}
