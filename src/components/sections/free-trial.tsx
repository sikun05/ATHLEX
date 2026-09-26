"use client";

import { useState } from "react";
import { media } from "@/lib/media";
import { Photo } from "@/components/ui/photo";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { Dialog } from "@/components/ui/dialog";
import { TrialBookingForm } from "@/components/forms/trial-booking-form";
import { Reveal, SplitWords } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/reveal";

export function FreeTrial() {
  const [open, setOpen] = useState(false);
  return (
    <section aria-labelledby="trial-heading" className="relative overflow-hidden">
      <Parallax className="absolute inset-0" offset={100}>
        <Photo src={media.trial} alt="" fill sizes="100vw" className="object-cover" />
      </Parallax>
      <div className="absolute inset-0 bg-ink/75" aria-hidden />
      <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_100%,rgba(200,255,46,0.18),transparent_70%)]" aria-hidden />

      <div className="container-x relative flex min-h-[80vh] flex-col items-center justify-center py-28 text-center">
        <Reveal>
          <p className="eyebrow">No commitment · 100% free</p>
        </Reveal>
        <SplitWords as="h2" id="trial-heading" text="Ready to start?" className="display mt-6 text-[clamp(3.5rem,13vw,10rem)]" highlight={[2]} />
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-md text-lg text-bone/75">Experience the gym before you commit. A coach, a tour, a real workout — on us.</p>
        </Reveal>
        <Reveal delay={0.3} className="mt-10">
          <Magnetic strength={0.4}>
            <Button size="lg" arrow onClick={() => setOpen(true)} className="h-16 px-10 text-sm">
              Book a free trial
            </Button>
          </Magnetic>
        </Reveal>
        <Reveal delay={0.4}>
          <ul className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-smoke">
            <li>✓ Guided tour</li>
            <li>✓ Fitness assessment</li>
            <li>✓ Coached session</li>
          </ul>
        </Reveal>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Book a free trial" description="Pick a time that suits you — we'll take care of the rest." size="lg">
        <TrialBookingForm onDone={() => setOpen(false)} />
      </Dialog>
    </section>
  );
}
