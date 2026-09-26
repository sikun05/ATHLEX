import Link from "next/link";
import { AlarmClock, CalendarCheck, CreditCard, IndianRupee, ScanLine, UserCheck, UserPlus, Users } from "lucide-react";
import { requireUser, DESK_ROLES } from "@/lib/auth/session";
import { getAdminOverview } from "@/lib/admin/stats";
import { Card, PageHeader, Stat } from "@/components/dashboard/ui";
import { BarsChart } from "@/components/dashboard/charts";
import { Badge, statusTone } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { formatDate, inr } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default async function AdminHome() {
  const user = await requireUser(DESK_ROLES, "/admin");
  const d = await getAdminOverview();
  const staff = user.role !== "trainer";
  const k = d.kpis;

  return (
    <>
      <PageHeader
        eyebrow={formatDate(new Date(), { weekday: "long", day: "numeric", month: "long" })}
        title="Club overview"
        actions={
          <>
            <ButtonLink href="/admin/attendance" size="sm">
              <ScanLine className="size-4" /> Open scanner
            </ButtonLink>
            {staff && (
              <ButtonLink href="/admin/reports" size="sm" variant="outline">
                Reports
              </ButtonLink>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total members" value={k.totalMembers} icon={<Users className="size-4" />} />
        <Stat label="Active members" value={k.activeMembers} tone="volt" hint={`${k.totalMembers ? Math.round((k.activeMembers / k.totalMembers) * 100) : 0}% of total`} icon={<UserCheck className="size-4" />} />
        <Stat label="New members" value={k.newMembers} hint="last 30 days" icon={<UserPlus className="size-4" />} />
        <Stat label="Trial bookings" value={k.trialBookings} hint="new & upcoming" icon={<CalendarCheck className="size-4" />} />
        <Stat label="Today's attendance" value={k.todaysAttendance} hint={`${k.onFloor} on the floor now`} icon={<ScanLine className="size-4" />} />
        {staff && <Stat label="Revenue (month)" value={inr(k.revenueThisMonth)} tone="ok" icon={<IndianRupee className="size-4" />} />}
        {staff && <Stat label="Pending payments" value={k.pendingPayments} hint={inr(k.pendingAmount)} tone={k.pendingPayments ? "warn" : undefined} icon={<CreditCard className="size-4" />} />}
        <Stat label="Expiring (7 days)" value={k.expiringSoon} tone={k.expiringSoon ? "warn" : undefined} icon={<AlarmClock className="size-4" />} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {staff && (
          <Card title="Revenue · last 6 months (₹)">
            <BarsChart data={d.revenueByMonth} x="month" y="revenue" label="Revenue by month" format="thousands" />
          </Card>
        )}
        <Card title="Check-ins · last 14 days">
          <BarsChart data={d.attendanceByDay} x="day" y="visits" label="Daily check-ins" />
        </Card>
        <Card title="New members per month">
          <BarsChart data={d.newByMonth} x="month" y="members" label="New members by month" height={200} />
        </Card>

        <Card title="Expiring this week" action={<Link href="/admin/memberships" className="text-xs text-volt hover:underline">All memberships</Link>}>
          {d.expiring.length ? (
            <ul className="divide-y divide-white/[0.06]">
              {d.expiring.slice(0, 6).map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <span className="block font-semibold">{m.member?.full_name ?? "Member"}</span>
                    <span className="text-xs text-smoke">{m.member?.phone}</span>
                  </span>
                  <Badge tone="warn">{formatDate(m.end_date, { day: "numeric", month: "short" })}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-smoke">No memberships expiring in the next 7 days.</p>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {staff && (
          <Card title="Latest trial bookings" action={<Link href="/admin/trial-bookings" className="text-xs text-volt hover:underline">Manage</Link>}>
            <ul className="divide-y divide-white/[0.06]">
              {d.trials.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <span className="block font-semibold">{t.name}</span>
                    <span className="text-xs text-smoke">
                      {t.interest} · {formatDate(t.preferred_date, { day: "numeric", month: "short" })} {t.preferred_time}
                    </span>
                  </span>
                  <Badge tone={statusTone(t.status)}>{t.status}</Badge>
                </li>
              ))}
              {!d.trials.length && <li className="py-3 text-sm text-smoke">No trial bookings yet.</li>}
            </ul>
          </Card>
        )}
        {staff && (
          <Card title="Recent payments" action={<Link href="/admin/payments" className="text-xs text-volt hover:underline">Ledger</Link>}>
            <ul className="divide-y divide-white/[0.06]">
              {d.recentPayments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <span className="block font-semibold">{p.member?.full_name ?? "Member"}</span>
                    <span className="text-xs text-smoke">{formatDate(p.created_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-semibold">{inr(p.amount_paise)}</span>
                    <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </>
  );
}
