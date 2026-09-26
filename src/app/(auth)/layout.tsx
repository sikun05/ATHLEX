import Link from "next/link";
import { Photo } from "@/components/ui/photo";
import { Logo } from "@/components/ui/logo";
import { media } from "@/lib/media";
import { isDemoMode } from "@/lib/env";
import { DEMO_ACCOUNTS } from "@/lib/db/demo-seed";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  const demo = isDemoMode();
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden lg:block" aria-hidden>
        <Photo src={media.heroAlt} alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
        <div className="absolute inset-x-12 bottom-12">
          <p className="display text-6xl sm:text-7xl leading-[0.85]">
            Show up.
            <br />
            <span className="text-volt">Level up.</span>
          </p>
          <p className="mt-4 max-w-sm text-bone/70">Your membership, workouts, diet plan, classes and progress — all in one place.</p>
        </div>
      </aside>
      <main id="main" className="flex flex-col px-5 py-8 sm:px-12">
        <Link href="/" aria-label="ATHLEX home" className="self-start">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">{children}</div>
        {demo && (
          <details className="mx-auto w-full max-w-md rounded-[var(--radius-card)] border border-volt/25 bg-volt/5 p-4 text-sm">
            <summary className="cursor-pointer font-mono text-[0.7rem] uppercase tracking-[0.18em] text-volt">Demo mode · test accounts</summary>
            <p className="mt-3 text-xs text-smoke">Supabase isn&apos;t configured, so data lives in memory and resets on restart.</p>
            <ul className="mt-3 space-y-1 font-mono text-xs">
              {DEMO_ACCOUNTS.map((a) => (
                <li key={a.email} className="flex justify-between gap-3">
                  <span className="uppercase text-smoke">{a.role}</span>
                  <span>
                    {a.email} / {a.password}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </main>
    </div>
  );
}
