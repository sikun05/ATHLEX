"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label = "Download receipt" }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-xs font-semibold uppercase tracking-[0.08em] hover:border-volt hover:text-volt">
      <Printer className="size-4" /> {label}
    </button>
  );
}
