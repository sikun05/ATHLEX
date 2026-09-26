import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Membership } from "@/components/sections/membership";
import { Reveal } from "@/components/motion/reveal";
import { getActiveOffer, getPlans } from "@/lib/data";
import { faqs } from "@/lib/content";
import { media } from "@/lib/media";
import { pageMetadata, JsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Membership Plans & Pricing",
  description: "Gym membership plans from 1 to 12 months. No joining fee, unlimited classes, personal training and secure online payment via Razorpay.",
  path: "/membership",
  image: media.hero,
});

export const revalidate = 300;

const matrix: [string, boolean[]][] = [
  ["Full gym floor access", [true, true, true, true]],
  ["Lockers, showers & towels", [true, true, true, true]],
  ["QR check-in & member app", [true, true, true, true]],
  ["Unlimited group classes", [false, true, true, true]],
  ["Body composition scans", [false, true, true, true]],
  ["Custom workout & diet plan", [false, false, true, true]],
  ["Personal training sessions", [false, false, true, true]],
  ["Recovery zone", [false, false, true, true]],
  ["Guest passes & priority booking", [false, false, false, true]],
];

export default async function MembershipPage() {
  const [plans, offer] = await Promise.all([getPlans(), getActiveOffer()]);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "OfferCatalog",
          name: `${site.name} memberships`,
          itemListElement: plans.map((p) => ({
            "@type": "Offer",
            name: `${p.name} — ${p.durationMonths} month${p.durationMonths > 1 ? "s" : ""}`,
            price: (p.price / 100).toFixed(0),
            priceCurrency: "INR",
            url: `${site.url}/checkout/${p.slug}`,
            seller: { "@id": `${site.url}/#gym` },
          })),
        }}
      />
      <PageHero eyebrow="Membership" title="Choose your commitment." image={media.heroAlt}>
        Pick a plan, register in two minutes and pay securely online. Your membership activates the moment payment is verified.
      </PageHero>
      {offer && (
        <div className="container-x -mt-6 mb-6">
          <Reveal className="flex flex-col items-start gap-3 rounded-[var(--radius-card)] border border-volt/30 bg-volt/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="mr-3 rounded bg-volt px-2 py-1 font-mono text-[0.65rem] font-bold uppercase text-ink">{offer.discount_label ?? "Offer"}</span>
              <strong>{offer.title}</strong> <span className="text-smoke">— {offer.description}</span>
            </p>
          </Reveal>
        </div>
      )}
      <Membership plans={plans} />

      <section className="section-y" aria-labelledby="compare-title">
        <div className="container-x">
          <h2 id="compare-title" className="display text-5xl sm:text-6xl">
            Compare plans
          </h2>
          <div className="mt-10 overflow-x-auto rounded-[var(--radius-card)] border border-white/[0.08]">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <caption className="sr-only">Feature comparison across membership plans</caption>
              <thead className="bg-graphite">
                <tr>
                  <th scope="col" className="p-5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-smoke">
                    Feature
                  </th>
                  {plans.map((p) => (
                    <th key={p.slug} scope="col" className={`p-5 text-center display text-2xl ${p.highlighted ? "text-volt" : ""}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {matrix.map(([feature, has]) => (
                  <tr key={feature} className="hover:bg-white/[0.02]">
                    <th scope="row" className="p-5 font-normal text-bone/85">
                      {feature}
                    </th>
                    {plans.map((p, i) => (
                      <td key={p.slug} className="p-5 text-center">
                        {has[i] ? <Check className="mx-auto size-4 text-volt" aria-label="Included" /> : <Minus className="mx-auto size-4 text-ash" aria-label="Not included" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-y bg-coal pt-20" aria-labelledby="mfaq">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <h2 id="mfaq" className="display text-5xl lg:col-span-4">
            Questions
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
