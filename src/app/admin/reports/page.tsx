import Link from "next/link";
import { Download } from "lucide-react";
import { requireUser, STAFF_ROLES } from "@/lib/auth/session";
import { getReports } from "@/lib/admin/stats";
import { Card, PageHeader, Stat } from "@/components/dashboard/ui";
import { BarsChart } from "@/components/dashboard/charts";
import { addDays, cn, inr, toISODate } from "@/lib/utils";

export const metadata = { title: "Reports" };

const RANGES = [
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
  { key: "365", label: "12 months" },
];

export default async function ReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  await requireUser(STAFF_ROLES, "/admin/reports");
  const { range: r } = await searchParams;
  const range = RANGES.some((x) => x.key === r) ? String(r) : "30";
  const from = addDays(new Date(), -Number(range));
  from.setHours(0, 0, 0, 0);
  const d = await getReports(from.toISOString(), new Date().toISOString());

  return (
    <>
      <PageHeader eyebrow="Insights" title="Reports">
        {toISODate(from)} → today
      </PageHeader>
      {/* Date range — one row above everything it scopes */}
      <nav aria-label="Date range" className="mb-6 flex flex-wrap gap-2">
        {RANGES.map((x) => (
          <Link key={x.key} href={`?range=${x.key}`} aria-current={x.key === range ? "true" : undefined} className={cn("rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider", x.key === range ? "border-volt bg-volt text-ink" : "border-white/10 text-smoke hover:text-bone")}>
            {x.label}
          </Link>
        ))}
      </nav>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Revenue" value={inr(d.totalRevenue)} tone="volt" />
        <Stat label="Memberships sold" value={d.sales} hint={`avg ${inr(d.avgOrder)}`} />
        <Stat label="Check-ins" value={d.visits} />
        <Stat label="Unique visitors" value={d.uniqueVisitors} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card title="Revenue by plan (₹)">
          {d.byPlan.length ? <BarsChart data={d.byPlan} x="plan" y="revenue" label="Revenue by plan" format="thousands" /> : <p className="text-sm text-smoke">No sales in this range.</p>}
        </Card>
        <Card title="Revenue by payment method (₹)">
          {d.byMethod.length ? <BarsChart data={d.byMethod} x="method" y="revenue" label="Revenue by payment method" format="thousands" /> : <p className="text-sm text-smoke">No sales in this range.</p>}
        </Card>
        <Card title="Peak hours · check-ins by hour" className="xl:col-span-2">
          <BarsChart data={d.byHour} x="hour" y="visits" label="Check-ins by hour of day" height={260} />
        </Card>
      </div>
      <Card title="Exports" className="mt-4">
        <div className="flex flex-wrap gap-2">
          {[
            ["members", "Members"],
            ["payments", "Payments"],
            ["memberships", "Memberships"],
            ["trial-bookings", "Trial bookings"],
            ["bookings", "Class bookings"],
            ["enquiries", "Enquiries"],
          ].map(([slug, label]) => (
            <a key={slug} href={`/api/admin/${slug}?format=csv`} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm hover:border-volt hover:text-volt">
              <Download className="size-3.5" /> {label}
            </a>
          ))}
        </div>
      </Card>
    </>
  );
}
