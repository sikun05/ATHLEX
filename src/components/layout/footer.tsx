"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { ArrowUp } from "lucide-react";
import { footerNav, site } from "@/lib/site";
import { programs } from "@/lib/content";
import { Logo } from "@/components/ui/logo";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { socials } from "@/components/ui/socials";


export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["-8%", "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [0.2, 0.6, 1]);

  return (
    <footer ref={ref} className="relative overflow-hidden border-t border-white/[0.06] bg-coal pt-20">
      <div className="pointer-events-none absolute -left-40 top-0 size-[40rem] rounded-full bg-volt/[0.04] blur-[140px]" aria-hidden />
      <div className="container-x relative">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-smoke">
              A premium strength & performance club for people who take training seriously — and want to enjoy every rep of it.
            </p>
            <ul className="mt-8 flex gap-2" aria-label="Social media">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-11 place-items-center rounded-full border border-white/10 text-smoke transition hover:-translate-y-0.5 hover:border-volt hover:text-volt"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-5">
            <FooterCol title="Explore" links={footerNav.explore} />
            <FooterCol title="Programs" links={programs.slice(0, 6).map((p) => ({ href: `/programs/${p.slug}`, label: p.name }))} />
            <FooterCol title="Membership" links={footerNav.tools} />
          </div>

          <div className="lg:col-span-3">
            <h3 className="eyebrow">Stay in the loop</h3>
            <p className="mt-4 text-sm text-smoke">Training tips, member events and early access to offers. No spam.</p>
            <NewsletterForm />
            <address className="mt-8 space-y-1.5 text-sm not-italic text-smoke">
              <p>
                {site.address.street}, {site.address.city} {site.address.postalCode}
              </p>
              <p>
                <a href={`tel:${site.phoneHref}`} className="hover:text-volt">
                  {site.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${site.email}`} className="hover:text-volt">
                  {site.email}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse items-start justify-between gap-6 border-t border-white/[0.06] py-8 text-xs text-ash sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1 [&_a]:inline-block [&_a]:py-2 [&_button]:py-2">
            {footerNav.legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-bone">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <button onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })} className="inline-flex items-center gap-1.5 hover:text-volt">
                Back to top <ArrowUp className="size-3" />
              </button>
            </li>
          </ul>
        </div>
      </div>

      <motion.p
        aria-hidden
        style={reduce ? undefined : { x, opacity }}
        className="display pointer-events-none -mb-[0.12em] select-none whitespace-nowrap text-center text-[14.5vw] leading-[0.8] text-outline"
      >
        Get stronger.
      </motion.p>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="eyebrow">{title}</h3>
      <ul className="mt-4 space-y-1">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="group inline-flex items-center gap-2 py-1.5 text-sm text-smoke transition hover:text-bone">
              <span className="h-px w-0 bg-volt transition-all duration-300 group-hover:w-3" aria-hidden />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
