import { requireUser } from "@/lib/auth/session";
import { attendanceStats, getAttendance } from "@/lib/dashboard";
import { getRepo } from "@/lib/db";
import { Card, PageHeader, Stat } from "@/components/dashboard/ui";
import { NoMemberProfile } from "@/components/dashboard/no-member";
import { MemberQr } from "@/components/dashboard/member-qr";
import { addDays, cn, formatDate, toISODate } from "@/lib/utils";

export const metadata = { title: "Check-in & Attendance" };

export default async function AttendancePage() {
  const user = await requireUser();
  if (!user.memberId) return <NoMemberProfile />;
  const [rows, member] = await Promise.all([getAttendance(user.memberId, 120), (await getRepo("user")).get("members", user.memberId)]);
  const stats = attendanceStats(rows);

  // 12-week heatmap, Monday-first columns
  const weeks = 12;
  const today = new Date();
  const start = addDays(today, -((today.getDay() + 6) % 7) - (weeks - 1) * 7);
  const cells = Array.from({ length: weeks * 7 }, (_, i) => {
    const d = addDays(start, i);
    return { date: toISODate(d), future: d > today, hit: stats.days.has(toISODate(d)) };
  });

  return (
    <>
      <PageHeader eyebrow="Attendance" title="Check in">
        Show this code at the front desk scanner. It changes every minute and only works for you.
      </PageHeader>
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="flex items-center justify-center py-10 lg:col-span-2">
          <MemberQr memberCode={member?.member_code ?? ""} />
        </Card>
        <div className="grid gap-4 lg:col-span-3">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="This month" value={stats.thisMonth} tone="volt" />
            <Stat label="Streak" value={stats.streak} hint="days" />
            <Stat label="Last 30 days" value={stats.last30} hint="visits" />
          </div>
          <Card title="Last 12 weeks">
            <div className="flex gap-3">
              <div className="grid grid-rows-7 gap-1 font-mono text-[0.7rem] text-ash" aria-hidden>
                {["M", "", "W", "", "F", "", "S"].map((d, i) => (
                  <span key={i} className="flex h-4 items-center">
                    {d}
                  </span>
                ))}
              </div>
              <ul className="grid flex-1 grid-flow-col grid-rows-7 gap-1" aria-label="Attendance heatmap">
                {cells.map((c) => (
                  <li key={c.date} title={`${formatDate(c.date)}${c.hit ? " · visited" : ""}`} className={cn("h-4 rounded-[3px]", c.future ? "bg-transparent" : c.hit ? "bg-volt" : "bg-steel")}>
                    <span className="sr-only">
                      {formatDate(c.date)}: {c.hit ? "visited" : "no visit"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
      <Card title="Attendance history" className="mt-4">
        <ul className="divide-y divide-white/[0.06]">
          {rows.slice(0, 20).map((r) => {
            const mins = r.check_out_at ? Math.round((new Date(r.check_out_at).getTime() - new Date(r.check_in_at).getTime()) / 60000) : null;
            return (
              <li key={r.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="font-semibold">{formatDate(r.check_in_at, { weekday: "short", day: "numeric", month: "short" })}</span>
                <span className="text-smoke">
                  {formatDate(r.check_in_at, { hour: "numeric", minute: "2-digit" })}
                  {r.check_out_at ? ` → ${formatDate(r.check_out_at, { hour: "numeric", minute: "2-digit" })}` : " · on the floor"}
                </span>
                <span className="font-mono text-xs text-ash">{mins ? `${mins} min` : r.method.toUpperCase()}</span>
              </li>
            );
          })}
          {!rows.length && <li className="py-3 text-sm text-smoke">No visits yet — see you on the floor!</li>}
        </ul>
      </Card>
    </>
  );
}
