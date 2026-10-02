"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";
import { Menu, UserRound } from "lucide-react";
import { nav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { MobileMenu } from "./mobile-menu";
import { usePreloaded } from "./preloader";
import { useSession } from "./use-session";

export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const ready = usePreloaded();
  const session = useSession();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const accountHref = session ? (session.role === "member" ? "/dashboard" : "/admin") : "/login";

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : undefined}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={cn(
            "transition-[background,border-color,backdrop-filter] duration-500",
            scrolled ? "glass border-x-0 border-t-0" : "border-b border-transparent bg-gradient-to-b from-black/50 to-transparent",
          )}
        >
          <nav aria-label="Main" className="container-x flex h-[var(--header-h)] items-center justify-between gap-4 xl:gap-6">
            <Link href="/" aria-label="ATHLEX home" className="shrink-0">
              <Logo />
            </Link>

            <ul className="hidden items-center lg:flex xl:gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "relative px-2.5 py-2 text-[0.72rem] font-medium uppercase tracking-[0.1em] transition-colors xl:px-3.5 xl:text-[0.78rem] xl:tracking-[0.12em]",
                      isActive(item.href) ? "text-bone" : "text-smoke hover:text-bone",
                    )}
                  >
                    {item.label}
                    {isActive(item.href) && (
                      <motion.span layoutId="nav-active" className="absolute inset-x-2.5 -bottom-0.5 h-[2px] bg-volt xl:inset-x-3.5" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <Link
                href={accountHref}
                aria-label={session ? "My account" : "Member login"}
                className="hidden size-11 place-items-center rounded-full border border-white/10 text-smoke transition hover:border-volt hover:text-volt sm:grid"
              >
                <UserRound className="size-4" />
              </Link>
              <Magnetic className="hidden sm:inline-block">
                <ButtonLink href="/membership" size="md" arrow>
                  Join now
                </ButtonLink>
              </Magnetic>
              <ButtonLink href="/membership" size="sm" className="sm:hidden">
                Join
              </ButtonLink>
              <button
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="grid size-11 place-items-center rounded-full border border-white/10 lg:hidden"
              >
                <Menu className="size-5" />
              </button>
            </div>
          </nav>
        </div>
      </motion.header>
      <MobileMenu open={open} onClose={() => setOpen(false)} accountHref={accountHref} signedIn={Boolean(session)} />
    </>
  );
}
