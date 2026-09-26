import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "volt" | "ok" | "warn" | "danger"; className?: string }) {
  const tones = {
    neutral: "border-white/10 bg-white/5 text-smoke",
    volt: "border-volt/30 bg-volt/10 text-volt",
    ok: "border-ok/30 bg-ok/10 text-ok",
    warn: "border-warn/30 bg-warn/10 text-warn",
    danger: "border-danger/30 bg-danger/10 text-danger",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.14em]", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton h-4 w-full", className)} />;
}

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-white/10 px-6 py-14 text-center">
      {icon && <div className="grid size-12 place-items-center rounded-full bg-white/5 text-volt">{icon}</div>}
      <p className="font-semibold">{title}</p>
      {children && <p className="max-w-sm text-sm text-smoke">{children}</p>}
      {action}
    </div>
  );
}

export const statusTone = (status?: string | null): "neutral" | "volt" | "ok" | "warn" | "danger" => {
  switch (status) {
    case "active":
    case "paid":
    case "confirmed":
    case "present":
    case "published":
    case "attended":
    case "completed":
      return "ok";
    case "pending":
    case "created":
    case "new":
    case "scheduled":
    case "booked":
    case "draft":
      return "warn";
    case "expired":
    case "failed":
    case "cancelled":
    case "refunded":
    case "no_show":
      return "danger";
    default:
      return "neutral";
  }
};
