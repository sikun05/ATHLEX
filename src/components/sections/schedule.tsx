"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Clock, Flame, MapPin, SlidersHorizontal, X } from "lucide-react";
import type { ClassSchedule, ClassType, Trainer } from "@/lib/types";
import { DAYS, timeSlot } from "@/lib/content/classes";
import { api, ClientApiError } from "@/lib/client-api";
import { cn, formatDate, toISODate, addDays } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/section-heading";

type Props = { classes: ClassType[]; schedules: ClassSchedule[]; trainers: Trainer[]; headingLevel?: "h1" | "h2"; compact?: boolean };

const todayIdx = () => (new Date().getDay() + 6) % 7;

/** Next calendar date for a weekday slot (today if the class hasn't started yet). */
export function nextOccurrence(day: number, start: string) {
  const now = new Date();
  let diff = (day - todayIdx() + 7) % 7;
  if (diff === 0) {
    const [h, m] = start.split(":").map(Number);
    const startsAt = new Date(now);
    startsAt.setHours(h, m, 0, 0);
    if (startsAt <= now) diff = 7;
  }
  return toISODate(addDays(now, diff));
}

const fmt = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
};

export function Schedule({ classes, schedules, trainers, headingLevel = "h2", compact }: Props) {
  const router = useRouter();
  const [day, setDay] = useState<number | "all">(compact ? todayIdx() : "all");
  const [slot, setSlot] = useState("all");
  const [trainer, setTrainer] = useState("all");
  const [category, setCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [booked, setBooked] = useState<Record<string, boolean>>({});

  const classById = useMemo(() => Object.fromEntries(classes.map((c) => [c.id, c])), [classes]);
  const trainerById = useMemo(() => Object.fromEntries(trainers.map((t) => [t.id, t])), [trainers]);
  const categories = useMemo(() => [...new Set(classes.map((c) => c.category))], [classes]);

  const filtered = schedules.filter((s) => {
    const c = classById[s.classId];
    return (
      c &&
      (day === "all" || s.day === day) &&
      (slot === "all" || timeSlot(s.start) === slot) &&
      (trainer === "all" || s.trainerId === trainer) &&
      (category === "all" || c.category === category)
    );
  });

  const byDay = DAYS.map((name, i) => ({ name, i, items: filtered.filter((s) => s.day === i) })).filter((d) => d.items.length);
  const activeFilters = [slot, trainer, category].filter((v) => v !== "all").length;

  const book = async (s: ClassSchedule) => {
    const classDate = nextOccurrence(s.day, s.start);
    setPending(s.id);
    try {
      await api("/api/class-bookings", { body: { scheduleId: s.id, classDate } });
      setBooked((b) => ({ ...b, [s.id]: true }));
      toast.success(`Booked ${classById[s.classId]?.name}`, { description: `${formatDate(classDate, { weekday: "long", day: "numeric", month: "short" })} · ${fmt(s.start)}` });
    } catch (e) {
      if (e instanceof ClientApiError && e.status === 401) {
        toast.message("Sign in to book classes", { description: "Members can reserve spots up to 14 days ahead." });
        router.push(`/login?next=${encodeURIComponent("/schedule")}`);
      } else if (e instanceof ClientApiError && e.code === "NO_ACTIVE_MEMBERSHIP") {
        toast.error(e.message, { action: { label: "View plans", onClick: () => router.push("/membership") } });
      } else toast.error((e as Error).message);
    } finally {
      setPending(null);
    }
  };

  const reset = () => {
    setSlot("all");
    setTrainer("all");
    setCategory("all");
  };

  return (
    <section aria-label="Class schedule" className="section-y" id="schedule">
      <div className="container-x">
        <div className="mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading as={headingLevel} index="05" eyebrow="Class schedule" title="Find your class.">
            {schedules.length}+ coached sessions every week. Filter by day, time, coach or style — then reserve your spot in one tap.
          </SectionHeading>
        </div>

        {/* Day selector */}
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0" role="tablist" aria-label="Day">
          {(["all", 0, 1, 2, 3, 4, 5, 6] as const).map((d) => {
            const active = day === d;
            return (
              <button
                key={d}
                role="tab"
                aria-selected={active}
                onClick={() => setDay(d)}
                className={cn(
                  "relative shrink-0 rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition",
                  active ? "border-volt text-ink" : "border-white/10 text-smoke hover:border-white/30 hover:text-bone",
                )}
              >
                {active && <motion.span layoutId="day-pill" className="absolute inset-0 rounded-full bg-volt" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className="relative">
                  {d === "all" ? "All week" : DAYS[d].slice(0, 3)}
                  {d === todayIdx() && <span className="ml-1.5 font-mono text-[0.55rem] opacity-70">TODAY</span>}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            aria-controls="schedule-filters"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.12em] text-smoke hover:text-bone md:hidden"
          >
            <SlidersHorizontal className="size-3.5" /> Filters {activeFilters > 0 && <span className="rounded-full bg-volt px-1.5 text-ink">{activeFilters}</span>}
          </button>
          <div id="schedule-filters" className={cn("w-full gap-3 md:grid md:w-auto md:grid-cols-3", showFilters ? "grid" : "hidden")}>
            <FilterSelect label="Time" value={slot} onChange={setSlot} options={["Morning", "Afternoon", "Evening"].map((v) => [v, v])} />
            <FilterSelect label="Trainer" value={trainer} onChange={setTrainer} options={trainers.map((t) => [t.id, t.name])} />
            <FilterSelect label="Class type" value={category} onChange={setCategory} options={categories.map((c) => [c, c])} />
          </div>
          {activeFilters > 0 && (
            <button onClick={reset} className="inline-flex items-center gap-1 text-xs text-smoke underline-offset-4 hover:text-volt hover:underline">
              <X className="size-3" /> Clear filters
            </button>
          )}
          <p className="ml-auto font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ash" aria-live="polite">
            {filtered.length} classes
          </p>
        </div>

        {/* Timetable */}
        <div className="mt-8 space-y-10">
          <AnimatePresence mode="popLayout">
            {byDay.length === 0 && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-[var(--radius-card)] border border-dashed border-white/10 py-16 text-center">
                <p className="font-semibold">No classes match those filters.</p>
                <button onClick={reset} className="mt-3 text-sm text-volt hover:underline">
                  Reset filters
                </button>
              </motion.div>
            )}
            {byDay.map(({ name, i, items }) => (
              <motion.div key={name} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <h3 className="mb-3 flex items-baseline gap-3">
                  <span className="display text-3xl">{name}</span>
                  {i === todayIdx() && <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-volt">Today</span>}
                </h3>
                <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-[var(--radius-card)] border border-white/[0.06]">
                  {items.map((s) => {
                    const c = classById[s.classId];
                    const t = trainerById[s.trainerId];
                    const left = Math.max(0, s.capacity - s.booked - (booked[s.id] ? 1 : 0));
                    const full = left === 0 && !booked[s.id];
                    return (
                      <motion.li layout key={s.id} className="group grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-3 bg-graphite/40 p-4 transition-colors hover:bg-graphite sm:p-5 md:grid-cols-[7rem_1.4fr_1fr_1fr_auto]">
                        <div className="font-mono text-sm">
                          <p className="text-bone">{fmt(s.start)}</p>
                          <p className="text-xs text-ash">{c.durationMin} min</p>
                        </div>
                        <div>
                          <p className="font-semibold">{c.name}</p>
                          <p className="mt-0.5 flex items-center gap-2 text-xs text-smoke">
                            <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider">{c.category}</span>
                            <span className="flex" aria-label={`Intensity ${c.intensity} of 5`}>
                              {Array.from({ length: 5 }, (_, k) => (
                                <Flame key={k} className={cn("size-3", k < c.intensity ? "text-volt" : "text-white/15")} aria-hidden />
                              ))}
                            </span>
                          </p>
                        </div>
                        <p className="col-span-2 flex items-center gap-2 text-sm text-smoke md:col-span-1">
                          <span className="size-6 shrink-0 rounded-full bg-steel text-center font-mono text-[0.6rem] leading-6 text-bone">{t?.name.split(" ").map((p) => p[0]).join("")}</span>
                          {t?.name ?? "TBA"}
                        </p>
                        <div className="col-span-2 flex items-center gap-4 text-xs text-smoke md:col-span-1">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" /> {s.room}
                          </span>
                          <span className={cn("inline-flex items-center gap-1", left <= 3 && "text-warn", full && "text-danger")}>
                            <Clock className="size-3" /> {full ? "Full" : `${left} spots`}
                          </span>
                        </div>
                        <button
                          onClick={() => book(s)}
                          disabled={full || pending === s.id || booked[s.id]}
                          data-cursor="click"
                          className={cn(
                            "col-span-2 h-11 rounded-full px-6 text-[0.68rem] font-bold uppercase tracking-[0.12em] transition md:col-span-1",
                            booked[s.id] ? "bg-ok/15 text-ok" : full ? "cursor-not-allowed bg-white/5 text-ash" : "bg-bone text-ink hover:bg-volt",
                          )}
                        >
                          {booked[s.id] ? "Booked ✓" : pending === s.id ? "Booking…" : full ? "Waitlist full" : "Book class"}
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
  const id = `f-${label.replace(/\s/g, "").toLowerCase()}`;
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="field h-11 min-w-44 rounded-full py-0 text-sm">
        <option value="all">All {label.toLowerCase()}s</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}
