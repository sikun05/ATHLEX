import { Utensils } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getDietPlan } from "@/lib/dashboard";
import { Card, PageHeader, Ring } from "@/components/dashboard/ui";
import { NoMemberProfile } from "@/components/dashboard/no-member";
import { EmptyState } from "@/components/ui/misc";

export const metadata = { title: "Diet Plan" };

export default async function DietPage() {
  const user = await requireUser();
  if (!user.memberId) return <NoMemberProfile />;
  const data = await getDietPlan(user.memberId);
  if (!data)
    return (
      <>
        <PageHeader title="Diet plan" />
        <EmptyState icon={<Utensils className="size-5" />} title="No diet plan assigned yet">
          Premium & Elite members receive a custom nutrition plan from our coaches.
        </EmptyState>
      </>
    );
  const { plan, meals, trainer } = data;
  const totals = meals.reduce((a, m) => ({ cal: a.cal + m.calories, p: a.p + m.protein_g, c: a.c + m.carbs_g, f: a.f + m.fats_g }), { cal: 0, p: 0, c: 0, f: 0 });
  const macros = [
    { label: "Protein", g: plan.protein_g, have: totals.p, kcal: 4 },
    { label: "Carbs", g: plan.carbs_g, have: totals.c, kcal: 4 },
    { label: "Fats", g: plan.fats_g, have: totals.f, kcal: 9 },
  ];

  return (
    <>
      <PageHeader eyebrow="Nutrition" title={plan.title}>
        Prepared by {trainer?.name ?? "your coach"}. {plan.notes}
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Daily target" className="flex flex-col items-center">
          <Ring value={totals.cal} max={plan.daily_calories} size={170} label={<span><span className="display block text-5xl">{plan.daily_calories.toLocaleString("en-IN")}</span><span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-smoke">kcal / day</span></span>} />
          <p className="mt-4 text-xs text-smoke">Meals below add up to {totals.cal.toLocaleString("en-IN")} kcal</p>
        </Card>
        <Card title="Macros" className="lg:col-span-2">
          <ul className="space-y-6">
            {macros.map((m) => (
              <li key={m.label}>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="font-semibold">{m.label}</span>
                  <span className="text-sm">
                    <span className="display text-2xl">{m.g}g</span>
                    <span className="ml-2 text-xs text-smoke">{Math.round(((m.g * m.kcal) / plan.daily_calories) * 100)}% of kcal</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-steel">
                  <div className="h-full rounded-full bg-volt" style={{ width: `${Math.min(100, (m.have / m.g) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card title="Daily meals" className="mt-4">
        <ol className="relative space-y-4 border-l border-white/10 pl-6">
          {meals.map((m) => (
            <li key={m.id} className="relative">
              <span className="absolute -left-[1.85rem] top-1.5 size-3 rounded-full border-2 border-ink bg-volt" aria-hidden />
              <div className="flex flex-col gap-3 rounded-md bg-graphite p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-volt">{m.meal_time}</p>
                  <p className="text-lg font-semibold">{m.name}</p>
                  <p className="text-sm text-smoke">{m.items}</p>
                </div>
                <dl className="grid shrink-0 grid-cols-4 gap-4 text-center text-sm">
                  {[
                    ["kcal", m.calories],
                    ["P", `${m.protein_g}g`],
                    ["C", `${m.carbs_g}g`],
                    ["F", `${m.fats_g}g`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="font-mono text-[0.7rem] uppercase text-smoke">{k}</dt>
                      <dd className="font-bold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </>
  );
}
