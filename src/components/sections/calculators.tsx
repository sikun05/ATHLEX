"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";
import { bmi, bmiCategory, bmr, type Gender } from "@/lib/fitness";

const TABS = ["BMI", "BMR", "Calories"] as const;

const activityLevels = [
  { value: 1.2, label: "Sedentary", hint: "Little or no exercise" },
  { value: 1.375, label: "Light", hint: "1–3 days/week" },
  { value: 1.55, label: "Moderate", hint: "3–5 days/week" },
  { value: 1.725, label: "Very active", hint: "6–7 days/week" },
  { value: 1.9, label: "Athlete", hint: "2× per day / physical job" },
];
const goals = [
  { value: -500, label: "Lose fat", hint: "≈0.5 kg/week" },
  { value: -250, label: "Lean cut", hint: "Slow & steady" },
  { value: 0, label: "Maintain", hint: "Stay where you are" },
  { value: 300, label: "Build muscle", hint: "Lean bulk" },
];

export function Calculators({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("BMI");
  const [height, setHeight] = useState(172);
  const [weight, setWeight] = useState(72);
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState<Gender>("male");
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState(0);

  const bmiVal = useMemo(() => bmi(weight, height), [weight, height]);
  const bmrVal = useMemo(() => bmr(gender, weight, height, age), [gender, weight, height, age]);
  const tdee = Math.round(bmrVal * activity);
  const target = Math.max(1200, tdee + goal);
  const cat = bmiCategory(bmiVal);
  // BMI 15–40 mapped onto the gauge
  const gaugePos = Math.min(100, Math.max(0, ((bmiVal - 15) / 25) * 100));

  const protein = Math.round(weight * (goal > 0 ? 2 : 1.8));
  const fats = Math.round((target * 0.25) / 9);
  const carbs = Math.max(0, Math.round((target - protein * 4 - fats * 9) / 4));

  return (
    <section aria-label="Fitness calculators" className="section-y relative overflow-hidden" id="calculators">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading as={headingLevel} index="08" eyebrow="Tools" title="Know your numbers.">
            Quick, science-based estimates to set your starting point. Our coaches refine them during your assessment.
          </SectionHeading>
          <div role="tablist" aria-label="Calculator" className="mt-10 inline-flex rounded-full border border-white/10 p-1">
            {TABS.map((t) => (
              <button
                key={t}
                role="tab"
                id={`calc-tab-${t}`}
                aria-selected={tab === t}
                aria-controls="calc-panel"
                onClick={() => setTab(t)}
                className={cn("relative rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition-colors sm:px-7", tab === t ? "text-ink" : "text-smoke hover:text-bone")}
              >
                {tab === t && <motion.span layoutId="calc-tab" className="absolute inset-0 rounded-full bg-volt" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className="relative">{t}</span>
              </button>
            ))}
          </div>
        </div>

        <div id="calc-panel" role="tabpanel" aria-labelledby={`calc-tab-${tab}`} className="grid gap-4 rounded-[var(--radius-card)] border border-white/[0.08] bg-graphite/60 p-5 sm:p-8 md:grid-cols-2 lg:col-span-7">
          {/* Inputs */}
          <div className="space-y-6">
            {tab !== "BMI" && (
              <fieldset>
                <legend className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-smoke">Gender</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(["male", "female"] as const).map((g) => (
                    <label key={g} className={cn("cursor-pointer rounded-[var(--radius-card)] border px-4 py-3 text-center text-sm capitalize transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-volt", gender === g ? "border-volt bg-volt/10 text-volt" : "border-white/10 text-smoke hover:border-white/25")}>
                      <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} className="sr-only" />
                      {g}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            {tab !== "BMI" && <Slider id="calc-age" label="Age" unit="yrs" value={age} min={14} max={80} onChange={setAge} />}
            <Slider id="calc-height" label="Height" unit="cm" value={height} min={130} max={215} onChange={setHeight} />
            <Slider id="calc-weight" label="Weight" unit="kg" value={weight} min={35} max={180} onChange={setWeight} />
            {tab === "Calories" && (
              <>
                <Choice label="Activity level" options={activityLevels} value={activity} onChange={setActivity} />
                <Choice label="Goal" options={goals} value={goal} onChange={setGoal} />
              </>
            )}
          </div>

          {/* Result */}
          <div className="flex flex-col justify-between rounded-[var(--radius-card)] bg-ink p-6" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {tab === "BMI" && (
                  <>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-smoke">Your BMI</p>
                    <p className="display mt-2 text-8xl tabular-nums">{bmiVal.toFixed(1)}</p>
                    <p className={cn("mt-1 text-lg font-semibold", cat.tone)}>{cat.label}</p>
                    <div className="mt-8">
                      <div className="relative h-2 rounded-full bg-[linear-gradient(90deg,#ffb547_0%,#ffb547_14%,#3ee08f_14%,#3ee08f_40%,#ffb547_40%,#ffb547_60%,#ff5a4e_60%)]">
                        <motion.span className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-ink bg-bone" animate={{ left: `${gaugePos}%` }} transition={{ type: "spring", stiffness: 200, damping: 25 }} aria-hidden />
                      </div>
                      <div className="mt-2 flex justify-between font-mono text-[0.58rem] text-ash">
                        <span>15</span>
                        <span>18.5</span>
                        <span>25</span>
                        <span>30</span>
                        <span>40</span>
                      </div>
                    </div>
                  </>
                )}
                {tab === "BMR" && (
                  <>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-smoke">Basal metabolic rate</p>
                    <p className="display mt-2 text-8xl tabular-nums">{bmrVal.toLocaleString("en-IN")}</p>
                    <p className="mt-1 text-smoke">kcal / day at complete rest</p>
                    <p className="mt-8 text-sm leading-relaxed text-smoke">This is the energy your body needs just to function. Your real daily burn is higher — switch to Calories to include activity.</p>
                  </>
                )}
                {tab === "Calories" && (
                  <>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-smoke">Daily target</p>
                    <p className="display mt-2 text-8xl tabular-nums text-volt">{target.toLocaleString("en-IN")}</p>
                    <p className="mt-1 text-smoke">kcal / day · maintenance {tdee.toLocaleString("en-IN")}</p>
                    <dl className="mt-8 grid grid-cols-3 gap-2 text-center">
                      {[
                        ["Protein", protein],
                        ["Carbs", carbs],
                        ["Fats", fats],
                      ].map(([l, v]) => (
                        <div key={l} className="rounded bg-graphite p-3">
                          <dt className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-smoke">{l}</dt>
                          <dd className="mt-1 text-xl font-bold tabular-nums">{v}g</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
            <p className="mt-6 text-[0.7rem] text-ash">Estimates only — not medical advice.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({ id, label, unit, value, min, max, onChange }: { id: string; label: string; unit: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-smoke">
          {label}
        </label>
        <span className="flex items-baseline gap-1">
          <input
            aria-label={`${label} in ${unit}`}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
            className="w-16 bg-transparent text-right text-lg font-bold tabular-nums outline-none focus:text-volt"
          />
          <span className="text-xs text-smoke">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-steel accent-volt [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-volt"
        style={{ background: `linear-gradient(90deg, #c8ff2e ${pct}%, #1e1e21 ${pct}%)` }}
      />
    </div>
  );
}

function Choice({ label, options, value, onChange }: { label: string; options: { value: number; label: string; hint: string }[]; value: number; onChange: (v: number) => void }) {
  const id = label.replace(/\s/g, "-").toLowerCase();
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.18em] text-smoke">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(Number(e.target.value))} className="field">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label} — {o.hint}
          </option>
        ))}
      </select>
    </div>
  );
}
