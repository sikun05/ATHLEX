import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { TrialBookingForm } from "@/components/forms/trial-booking-form";
import { Reveal, SplitWords } from "@/components/motion/reveal";
import { media } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Book a Free Trial",
  description: "Experience ATHLEX before you commit — a guided tour, fitness assessment and coached workout, completely free.",
  path: "/free-trial",
  image: media.trial,
});

export default async function FreeTrialPage({ searchParams }: PageProps<"/free-trial">) {
  const { interest } = await searchParams;
  return (
    <section className="relative min-h-screen overflow-hidden pt-32">
      <Photo src={media.trial} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/90 to-ink" aria-hidden />
      <div className="container-x relative grid gap-14 pb-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow">Free trial</p>
          <SplitWords as="h1" text="Ready to start?" animateOnMount className="display mt-6 text-[clamp(3.5rem,10vw,8rem)]" highlight={[2]} />
          <Reveal delay={0.3}>
            <p className="mt-6 max-w-md text-lg text-bone/75">Experience the gym before you commit.</p>
            <ul className="mt-10 space-y-4">
              {["Guided tour of the facility", "Movement & fitness assessment", "A full coached workout", "Personalised plan recommendation"].map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <span className="grid size-6 place-items-center rounded-full bg-volt text-ink">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal delay={0.2} className="glass rounded-[var(--radius-card)] p-6 sm:p-10 lg:col-span-7">
          <h2 className="display mb-8 text-4xl">Book your session</h2>
          <TrialBookingForm defaultInterest={typeof interest === "string" ? interest : undefined} />
        </Reveal>
      </div>
    </section>
  );
}
