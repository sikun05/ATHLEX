"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Ex = { id: string; day: string; exercise: string; sets: number; reps: string; rest: number; notes?: string | null };

export function WorkoutDays({ days, exercises }: { days: string[]; exercises: Ex[] }) {
  const [day, setDay] = useState(days[0]);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const list = exercises.filter((e) => e.day === day);
  const completed = list.filter((e) => done[e.id]).length;

  return (
    <div className="rounded-[var(--radius-card)] border border-white/[0.07] bg-coal">
      <div role="tablist" aria-label="Training day" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-white/[0.06] p-2">
        {days.map((d) => (
          <button key={d} role="tab" aria-selected={d === day} onClick={() => setDay(d)} className={cn("relative shrink-0 rounded-md px-4 py-2.5 text-sm font-medium", d === day ? "text-ink" : "text-smoke hover:text-bone")}>
            {d === day && <motion.span layoutId="wday" className="absolute inset-0 rounded-md bg-volt" />}
            <span className="relative">{d}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between px-5 pt-5">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-smoke">
          {completed}/{list.length} done today
        </p>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full bg-volt" animate={{ width: `${list.length ? (completed / list.length) * 100 : 0}%` }} />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.ol key={day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="divide-y divide-white/[0.06] p-2">
          {list.map((e, i) => (
            <li key={e.id} className="flex items-center gap-4 rounded-md p-3 hover:bg-white/[0.02]">
              <button
                onClick={() => setDone((d) => ({ ...d, [e.id]: !d[e.id] }))}
                aria-pressed={Boolean(done[e.id])}
                aria-label={`Mark ${e.exercise} ${done[e.id] ? "not done" : "done"}`}
                className={cn("grid size-9 shrink-0 place-items-center rounded-full border transition", done[e.id] ? "border-volt bg-volt text-ink" : "border-white/15 text-ash")}
              >
                {done[e.id] ? <Check className="size-4" strokeWidth={3} /> : <span className="font-mono text-xs">{i + 1}</span>}
              </button>
              <div className="min-w-0 flex-1">
                <p className={cn("font-semibold", done[e.id] && "text-smoke line-through")}>{e.exercise}</p>
                {e.notes && <p className="text-xs text-smoke">{e.notes}</p>}
              </div>
              <dl className="grid grid-cols-3 gap-4 text-center text-sm sm:gap-8">
                <div>
                  <dt className="font-mono text-[0.55rem] uppercase text-smoke">Sets</dt>
                  <dd className="font-bold">{e.sets}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.55rem] uppercase text-smoke">Reps</dt>
                  <dd className="font-bold">{e.reps}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.55rem] uppercase text-smoke">Rest</dt>
                  <dd className="font-bold">{e.rest >= 60 ? `${Math.floor(e.rest / 60)}:${String(e.rest % 60).padStart(2, "0")}` : `${e.rest}s`}</dd>
                </div>
              </dl>
            </li>
          ))}
        </motion.ol>
      </AnimatePresence>
    </div>
  );
}
