import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PageHeader({ title, eyebrow, children, actions }: { title: string; eyebrow?: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="display text-4xl sm:text-5xl">{title}</h1>
        {children && <p className="mt-2 max-w-2xl text-sm text-smoke">{children}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className, title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <section className={cn("rounded-[var(--radius-card)] border border-white/[0.07] bg-coal p-5 sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-smoke">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, tone, icon }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "volt" | "warn" | "danger" | "ok"; icon?: ReactNode }) {
  const tones = { volt: "text-volt", warn: "text-warn", danger: "text-danger", ok: "text-ok" };
  return (
    <div className="rounded-[var(--radius-card)] border border-white/[0.07] bg-coal p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-smoke">{label}</p>
        {icon && <span className="text-ash">{icon}</span>}
      </div>
      <p className={cn("display mt-3 text-4xl tabular-nums", tone && tones[tone])}>{value}</p>
      {hint && <p className="mt-1 text-xs text-smoke">{hint}</p>}
    </div>
  );
}

export function Ring({ value, max, size = 120, label }: { value: number; max: number; size?: number; label: ReactNode }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const pct = max ? Math.min(1, value / max) : 0;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e1e21" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#c8ff2e" strokeWidth={8} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{label}</div>
    </div>
  );
}
