"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { nav, site, whatsappLink } from "@/lib/site";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const EASE = [0.76, 0, 0.24, 1] as const;

export function MobileMenu({ open, onClose, accountHref, signedIn }: { open: boolean; onClose: () => void; accountHref: string; signedIn: boolean }) {
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => closeRef.current?.focus(), 100);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const links = [...nav, { href: "/schedule", label: "Schedule" }, { href: accountHref, label: signedIn ? "My Account" : "Login" }];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[80] flex flex-col bg-ink lg:hidden"
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.6, ease: EASE, delay: 0.15 } }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="pointer-events-none absolute -right-1/3 top-1/4 size-[36rem] rounded-full bg-volt/10 blur-[120px]" aria-hidden />
          <div className="container-x flex h-[var(--header-h)] items-center justify-between">
            <Logo />
            <button ref={closeRef} onClick={onClose} aria-label="Close menu" className="grid size-11 place-items-center rounded-full border border-white/15">
              <X className="size-5" />
            </button>
          </div>

          <nav aria-label="Mobile" className="container-x flex flex-1 flex-col justify-center">
            <ul className="flex flex-col">
              {links.map((item, i) => (
                <li key={item.href + item.label} className="overflow-hidden border-b border-white/[0.06]">
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: "0%", transition: { duration: 0.7, delay: 0.25 + i * 0.05, ease: [0.16, 1, 0.3, 1] } }}
                    exit={{ y: "110%", transition: { duration: 0.35, delay: (links.length - i) * 0.02, ease: EASE } }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn("group flex items-center justify-between py-3", pathname === item.href ? "text-volt" : "text-bone")}
                    >
                      <span className="display text-[clamp(2.4rem,11vw,4rem)]">{item.label}</span>
                      <span className="flex items-center gap-3">
                        <span className="font-mono text-xs text-ash">{String(i + 1).padStart(2, "0")}</span>
                        <ArrowUpRight className="size-6 text-ash transition group-active:translate-x-1 group-active:-translate-y-1 group-active:text-volt" />
                      </span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </nav>

          <motion.div
            className="container-x grid grid-cols-2 gap-3 pb-8 pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
            exit={{ opacity: 0 }}
          >
            <Link href="/membership" onClick={onClose} className="flex h-14 items-center justify-center rounded-full bg-volt text-xs font-bold uppercase tracking-[0.1em] text-ink">
              Join now
            </Link>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex h-14 items-center justify-center rounded-full border border-white/15 text-xs font-bold uppercase tracking-[0.1em]">
              WhatsApp
            </a>
            <a href={`tel:${site.phoneHref}`} className="col-span-2 text-center font-mono text-xs tracking-[0.18em] text-smoke">
              {site.phone}
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
