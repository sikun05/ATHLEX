import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { mapsEmbed, mapsLink, site, whatsappLink } from "@/lib/site";
import { ButtonLink } from "@/components/ui/button";
import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeading } from "@/components/ui/section-heading";
import { ClipReveal, Reveal } from "@/components/motion/reveal";
import { socials } from "@/components/ui/socials";

export function Contact({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  return (
    <section aria-label="Contact" className="section-y relative overflow-hidden bg-coal" id="contact">
      <div className="container-x">
        <SectionHeading as={headingLevel} index="11" eyebrow="Visit us" title="Come train with us." className="mb-14">
          Drop by for a tour, call the front desk or send us a message — we&apos;d love to meet you.
        </SectionHeading>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Map */}
          <ClipReveal className="relative min-h-[22rem] overflow-hidden rounded-[var(--radius-card)] border border-white/[0.06] lg:col-span-7 lg:min-h-[34rem]">
            <iframe
              title={`Map showing ${site.name} location`}
              src={mapsEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full grayscale invert-[0.92] hue-rotate-180 contrast-[0.9]"
            />
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full" aria-hidden>
              <span className="absolute left-1/2 top-full size-16 -translate-x-1/2 -translate-y-1/2 animate-pulse-ring rounded-full bg-volt/40" />
              <span className="relative block rounded-full bg-volt px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-ink shadow-2xl">{site.name}</span>
            </div>
            <div className="glass absolute bottom-4 left-4 right-4 flex flex-col gap-3 rounded-[var(--radius-card)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">
                <MapPin className="mr-1.5 inline size-4 text-volt" aria-hidden />
                {site.address.street}, {site.address.city}
              </p>
              <div className="flex gap-2">
                <ButtonLink href={mapsLink} external size="sm" arrow>
                  Get directions
                </ButtonLink>
              </div>
            </div>
          </ClipReveal>

          {/* Details */}
          <div className="grid gap-6 lg:col-span-5">
            <Reveal className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Info icon={<Phone className="size-4" />} label="Phone">
                <a href={`tel:${site.phoneHref}`} className="hover:text-volt">
                  {site.phone}
                </a>
              </Info>
              <Info icon={<Mail className="size-4" />} label="Email">
                <a href={`mailto:${site.email}`} className="break-all hover:text-volt">
                  {site.email}
                </a>
              </Info>
              <Info icon={<Clock className="size-4" />} label="Opening hours" className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                <ul className="space-y-1">
                  {site.hours.map((h) => (
                    <li key={h.days} className="flex justify-between gap-4">
                      <span className="text-smoke">{h.days}</span>
                      <span>{h.time}</span>
                    </li>
                  ))}
                </ul>
              </Info>
            </Reveal>
            <Reveal delay={0.1} className="flex flex-wrap items-center gap-3">
              <ButtonLink href={whatsappLink()} external variant="primary" arrow className="bg-[#25D366] text-white hover:bg-[#2ee676]">
                Chat on WhatsApp
              </ButtonLink>
              <ButtonLink href={mapsLink} external variant="outline" arrow>
                Get directions
              </ButtonLink>
              <ul className="flex gap-2" aria-label="Social media">
                {socials.slice(0, 3).map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-11 place-items-center rounded-full border border-white/10 text-smoke hover:border-volt hover:text-volt">
                      <Icon className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal className="rounded-[var(--radius-card)] border border-white/[0.06] bg-graphite/50 p-6 sm:p-10 lg:col-span-12">
            <h3 className="display mb-8 text-4xl">Send a message</h3>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Info({ icon, label, children, className }: { icon: React.ReactNode; label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-graphite p-6 ${className ?? ""}`}>
      <p className="mb-3 flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-volt">
        {icon}
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}
