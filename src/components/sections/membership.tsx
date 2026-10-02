import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import type { Plan } from "@/lib/types";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { buttonClasses } from "@/components/ui/button";
import { cn, inr } from "@/lib/utils";

export function Membership({ plans, headingLevel = "h2" }: { plans: Plan[]; headingLevel?: "h1" | "h2" }) {
  return (
    <section aria-label="Membership plans" className="section-y relative overflow-hidden bg-coal" id="plans">
      <div className="pointer-events-none absolute left-1/2 top-1/3 size-[50rem] -translate-x-1/2 rounded-full bg-volt/[0.05] blur-[160px]" aria-hidden />
      <div className="container-x relative">
        <SectionHeading as={headingLevel} index="04" eyebrow="Membership" title="Invest in yourself." align="center">
          Transparent pricing. No joining fee. Every plan includes full gym access, lockers and the ATHLEX member app.
        </SectionHeading>

        <Stagger as="ul" className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4" stagger={0.1}>
          {plans.map((p) => (
            <StaggerItem as="li" key={p.slug} className={cn(p.highlighted && "xl:-my-4")}>
              <PlanCard plan={p} />
            </StaggerItem>
          ))}
        </Stagger>

        <p className="mt-10 text-center text-xs text-ash">
          Prices in INR, inclusive of GST. Secure payments by Razorpay — UPI, cards, net banking & wallets. See our{" "}
          <Link href="/refund-policy" className="underline hover:text-bone">
            refund policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

export function PlanCard({ plan: p }: { plan: Plan }) {
  const perMonth = Math.round(p.price / p.durationMonths);
  const saving = p.compareAt ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100) : 0;
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border p-7 transition-all duration-500 ease-[var(--ease-expo)] hover:-translate-y-1.5 sm:p-8",
        p.highlighted ? "volt-glow border-volt/50 bg-gradient-to-b from-steel to-graphite xl:py-12" : "border-white/[0.08] bg-graphite/70 hover:border-white/20",
      )}
    >
      {p.highlighted && (
        <span className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-volt px-3 py-1.5 font-mono text-[0.7rem] font-bold uppercase tracking-[0.15em] text-ink">
          <Sparkles className="size-3" /> Most popular
        </span>
      )}
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-smoke">
        {p.durationMonths} {p.durationMonths === 1 ? "Month" : "Months"}
      </p>
      <h3 className={cn("display mt-3 text-h3", p.highlighted && "text-volt")}>{p.name}</h3>
      <p className="mt-2 text-sm text-smoke">{p.tagline}</p>

      <div className="mt-8 border-t border-white/[0.08] pt-8">
        <div className="flex items-end gap-3">
          <span className="display text-stat">{inr(p.price)}</span>
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-smoke">
          {p.compareAt && <span className="line-through decoration-danger/70">{inr(p.compareAt)}</span>}
          {saving > 0 && <span className="rounded bg-volt/10 px-1.5 py-0.5 font-semibold text-volt">Save {saving}%</span>}
          <span>≈ {inr(perMonth)}/month</span>
        </p>
      </div>

      <ul className="mt-8 flex-1 space-y-3.5">
        {p.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-bone/85">
            <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", p.highlighted ? "bg-volt text-ink" : "bg-white/10 text-volt")}>
              <Check className="size-3" strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={`/checkout/${p.slug}`}
        data-cursor="click"
        className={buttonClasses({ variant: p.highlighted ? "primary" : "outline", size: "lg", className: "mt-10 w-full" })}
        aria-label={`Choose the ${p.name} plan`}
      >
        Choose plan
      </Link>
    </article>
  );
}
