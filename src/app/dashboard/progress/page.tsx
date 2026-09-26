import { requireUser } from "@/lib/auth/session";
import { getMeasurements, getProgressPhotos } from "@/lib/dashboard";
import { Card, PageHeader, Stat } from "@/components/dashboard/ui";
import { NoMemberProfile } from "@/components/dashboard/no-member";
import { TrendChart } from "@/components/dashboard/charts";
import { AddMeasurement, DeleteMeasurement, ProgressPhotos } from "@/components/dashboard/progress-client";
import { EmptyState } from "@/components/ui/misc";
import { bmiCategory } from "@/lib/fitness";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Progress" };

export default async function ProgressPage() {
  const user = await requireUser();
  if (!user.memberId) return <NoMemberProfile />;
  const [rows, photos] = await Promise.all([getMeasurements(user.memberId), getProgressPhotos(user.memberId)]);
  const latest = rows.at(-1);
  const first = rows[0];
  const diff = (k: string) => (latest && first && latest[k] != null && first[k] != null ? Number(latest[k]) - Number(first[k]) : null);
  const fmt = (v: number | null, unit: string) => (v === null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(1)} ${unit}`);
  const series = (k: string) => rows.filter((r) => r[k] != null).map((r) => ({ date: r.measured_on, [k]: Number(r[k]) }));

  return (
    <>
      <PageHeader eyebrow="Progress" title="Your numbers" actions={<AddMeasurement />}>
        Log measurements every 2 weeks — same time of day, same conditions — for the clearest trend.
      </PageHeader>

      {rows.length === 0 ? (
        <EmptyState title="No measurements yet" action={<AddMeasurement />}>
          Add your first check-in to start tracking weight, BMI, body fat and measurements.
        </EmptyState>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Weight" value={<>{latest!.weight_kg}<span className="text-lg text-smoke"> kg</span></>} hint={`${fmt(diff("weight_kg"), "kg")} since start`} tone="volt" />
            <Stat label="BMI" value={latest!.bmi ?? "—"} hint={latest!.bmi ? bmiCategory(Number(latest!.bmi)).label : "Add height in profile"} />
            <Stat label="Body fat" value={latest!.body_fat_pct ? `${latest!.body_fat_pct}%` : "—"} hint={fmt(diff("body_fat_pct"), "%")} />
            <Stat label="Waist" value={latest!.waist_cm ? `${latest!.waist_cm}` : "—"} hint={fmt(diff("waist_cm"), "cm")} />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <Card title="Weight (kg)" className="xl:col-span-2">
              <TrendChart data={series("weight_kg")} dataKey="weight_kg" unit=" kg" label="Body weight" height={280} />
            </Card>
            <Card title="BMI">
              <TrendChart data={series("bmi")} dataKey="bmi" label="BMI" />
            </Card>
            <Card title="Body fat (%)">
              <TrendChart data={series("body_fat_pct")} dataKey="body_fat_pct" unit="%" label="Body fat percentage" />
            </Card>
          </div>

          <Card title="Body measurements" className="mt-4">
            <div className="-mx-5 overflow-x-auto sm:mx-0">
              <table className="w-full min-w-[44rem] text-left text-sm">
                <thead className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-smoke">
                  <tr>
                    {["Date", "Weight", "BMI", "Body fat", "Chest", "Waist", "Hips", "Arms", "Thighs", ""].map((h) => (
                      <th key={h} className="px-3 py-3 font-normal first:pl-5 sm:first:pl-3">
                        {h || <span className="sr-only">Actions</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] tabular-nums">
                  {[...rows].reverse().map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 py-3 pl-5 sm:pl-3">{formatDate(r.measured_on)}</td>
                      <td className="px-3 py-3 font-semibold">{r.weight_kg} kg</td>
                      <td className="px-3 py-3">{r.bmi ?? "—"}</td>
                      <td className="px-3 py-3">{r.body_fat_pct ? `${r.body_fat_pct}%` : "—"}</td>
                      {["chest_cm", "waist_cm", "hips_cm", "arms_cm", "thighs_cm"].map((k) => (
                        <td key={k} className="px-3 py-3 text-smoke">
                          {r[k] ?? "—"}
                        </td>
                      ))}
                      <td className="px-3 py-3 text-right">
                        <DeleteMeasurement id={r.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <Card title="Progress photos" className="mt-4">
        <ProgressPhotos photos={photos.map((p) => ({ id: p.id, url: p.url, takenOn: p.taken_on, caption: p.caption }))} />
      </Card>
    </>
  );
}
