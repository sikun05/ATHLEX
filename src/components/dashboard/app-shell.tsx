"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { LogOut, Menu, X, ExternalLink } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { api } from "@/lib/client-api";
import { resetSessionCache } from "@/components/layout/use-session";
import { cn, initials } from "@/lib/utils";
import { NAV_ICONS, type NavIcon } from "./nav-icons";

export type NavItem = { href: string; label: string; icon: NavIcon; group?: string };

/** Shared chrome for the member dashboard and admin console. */
export function AppShell({
  nav,
  user,
  area,
  children,
  mobileTabs,
}: {
  nav: NavItem[];
  user: { name: string; email: string; role: string };
  area: "Member" | "Admin";
  children: React.ReactNode;
  mobileTabs?: string[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const root = nav[0]?.href;
  const isActive = (href: string) => (href === root ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

  // Close the drawer on navigation (render-time state adjustment, no effect needed)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST", body: {} }).catch(() => {});
    resetSessionCache();
    toast.success("Signed out");
    router.replace("/login");
    router.refresh();
  };

  const groups = [...new Set(nav.map((n) => n.group ?? ""))];

  const sidebar = (
    <nav aria-label={`${area} navigation`} className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href={root ?? "/"} aria-label="Dashboard home">
          <Logo />
        </Link>
        <span className="rounded-full border border-volt/30 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-volt">{area}</span>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g) => (
          <div key={g} className="mb-5">
            {g && <p className="mb-2 px-3 font-mono text-[0.58rem] uppercase tracking-[0.22em] text-ash">{g}</p>}
            <ul className="space-y-0.5">
              {nav
                .filter((n) => (n.group ?? "") === g)
                .map((n) => {
                  const Icon = NAV_ICONS[n.icon];
                  const active = isActive(n.href);
                  return (
                    <li key={n.href}>
                      <Link
                        href={n.href}
                        aria-current={active ? "page" : undefined}
                        className={cn("relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors", active ? "text-ink" : "text-smoke hover:bg-white/5 hover:text-bone")}
                      >
                        {active && <motion.span layoutId={`${area}-nav`} className="absolute inset-0 rounded-md bg-volt" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                        <Icon className="relative size-4" aria-hidden />
                        <span className="relative font-medium">{n.label}</span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.06] p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-steel font-mono text-xs">{initials(user.name)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs capitalize text-smoke">{user.role}</p>
          </div>
          <button onClick={logout} aria-label="Sign out" className="grid size-9 place-items-center rounded-full text-smoke hover:bg-white/5 hover:text-danger">
            <LogOut className="size-4" />
          </button>
        </div>
        <Link href="/" className="mt-3 flex items-center gap-2 px-1 text-xs text-ash hover:text-bone">
          <ExternalLink className="size-3" /> Back to website
        </Link>
      </div>
    </nav>
  );

  const tabs = mobileTabs ? nav.filter((n) => mobileTabs.includes(n.href)) : [];

  return (
    <div className="min-h-dvh bg-ink lg:grid lg:grid-cols-[16.5rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r border-white/[0.06] bg-coal lg:block">{sidebar}</aside>

      {/* Mobile top bar */}
      <header className="glass sticky top-0 z-40 flex h-16 items-center justify-between border-x-0 border-t-0 px-4 lg:hidden">
        <Link href={root ?? "/"}>
          <Logo />
        </Link>
        <button onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open} className="grid size-10 place-items-center rounded-full border border-white/10">
          <Menu className="size-5" />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
            <motion.div className="absolute inset-0 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[82%] max-w-xs bg-coal"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <button onClick={() => setOpen(false)} aria-label="Close navigation" className="absolute -right-12 top-3 grid size-10 place-items-center rounded-full bg-coal">
                <X className="size-5" />
              </button>
              {sidebar}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main id="main" className={cn("min-w-0 px-4 pb-10 pt-6 sm:px-8 lg:px-10 lg:pt-10", tabs.length && "pb-28 lg:pb-10")}>
        {children}
      </main>

      {/* Mobile bottom tabs */}
      {tabs.length > 0 && (
        <nav aria-label="Quick navigation" className="glass fixed inset-x-0 bottom-0 z-40 grid border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] lg:hidden" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map((n) => {
            const Icon = NAV_ICONS[n.icon];
            const active = isActive(n.href);
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={cn("flex flex-col items-center gap-1 py-3 text-[0.6rem] font-semibold uppercase tracking-wider", active ? "text-volt" : "text-smoke")}>
                <Icon className="size-5" aria-hidden />
                {n.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
