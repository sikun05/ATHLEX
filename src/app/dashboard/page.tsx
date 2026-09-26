import Link from "next/link";
import { ArrowUpRight, CalendarDays, Dumbbell, Flame, QrCode, TrendingDown, TrendingUp, UserCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getMemberOverview } from "@/lib/dashboard";
import { Card, PageHeader, Ring, Stat } from "@/components/dashboard/ui";
import { NoMemberProfile } from "@/components/dashboard/no-member";
import { Badge, EmptyState } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { WeightSparkline } from "@/components/dashboard/charts";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user.memberId) return <NoMemberProfile />;
  const { membership, classes, upcomingPt, stats, measurements, notifications } = await getMemberOverview(user.memberId, user.id);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const totalDays = membership?.plan?.duration_days ?? 30;
  const latest = measurements.at(-1);
  const first = measurements[0];
  const delta = latest && first ? Number(latest.weight_kg) - Number(first.weight_kg) : 0;

  return (
    <>
      <PageHeader
        eyebrow={formatDate(new Date(), { weekday: "long", day: "numeric", month: "long" })}
        title={`${greeting}, ${user.name.split(" ")[0]}`}
        actions={
          <>
            <ButtonLink href="/dashboard/attendance" size="sm">
              <QrCode className="size-4" /> Check in
            </ButtonLink>
            <ButtonLink href="/schedule" size="sm" variant="outline">
              Book a class
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Membership */}
        <Card className="xl:col-span-2">
          {membership ? (
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <Ring value={membership.daysRemaining} max={totalDays} size={140} label={<span><span className="display block text-4xl">{membership.daysRemaining}</span><span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-smoke">days left</span></span>} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge tone={membership.daysRemaining <= 7 ? "warn" : "ok"}>{membership.daysRemaining <= 7 ? "Expiring soon" : "Active"}</Badge>
                  {membership.queued.length > 0 && <Badge tone="volt">Renewal queued</Badge>}
                </div>
                <p className="display mt-3 text-4xl">{membership.plan?.name} membership</p>
                <p className="mt-1 text-sm text-smoke">
                  {formatDate(membership.start_date)} → {formatDate(membership.effectiveEnd)}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <ButtonLink href={`/checkout/${membership.plan?.slug ?? "premium"}`} size="sm" variant={membership.daysRemaining <= 14 ? "primary" : "outline"}>
                    Renew membership
                  </ButtonLink>
                  <ButtonLink href="/dashboard/membership" size="sm" variant="ghost">
                    Details
                  </ButtonLink>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState title="No active membership" action={<ButtonLink href="/membership" arrow>Choose a plan</ButtonLink>}>
              Pick a plan to unlock the gym floor, classes and your personalised training.
            </EmptyState>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
          <Stat label="This month" value={stats.thisMonth} hint="check-ins" icon={<UserCheck className="size-4" />} tone="volt" />
          <Stat label="Streak" value={<>{stats.streak}<span className="text-lg text-smoke"> days</span></>} hint="consecutive" icon={<Flame className="size-4" />} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card title="Upcoming classes" action={<Link href="/dashboard/classes" className="text-xs text-volt hover:underline">View all</Link>}>
          {classes.length ? (
            <ul className="space-y-3">
              {classes.map((c) => (
                <li key={c.id} className="flex items-center gap-4 rounded-md bg-graphite p-3">
                  <div className="w-12 text-center">
                    <p className="font-mono text-[0.7rem] uppercase text-smoke">{formatDate(c.date, { weekday: "short" })}</p>
                    <p className="display text-2xl">{formatDate(c.date, { day: "2-digit" })}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{c.className}</p>
                    <p className="text-xs text-smoke">
                      {c.start} · {c.trainer} · {c.room}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<CalendarDays className="size-5" />} title="No classes booked" action={<Link href="/schedule" className="text-sm text-volt hover:underline">Browse timetable →</Link>} />
          )}
        </Card>

        <Card title="Personal training">
          {upcomingPt.length ? (
            <ul className="space-y-3">
              {upcomingPt.map((p) => (
                <li key={p.id} className="rounded-md bg-graphite p-3">
                  <p className="font-semibold">{formatDate(p.session_at, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>
                  <p className="text-xs text-smoke">
                    with {p.trainer} · {p.duration_min} min
                  </p>
                  {p.notes && <p className="mt-2 text-xs text-bone/70">{p.notes}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<Dumbbell className="size-5" />} title="No PT sessions scheduled">
              Premium & Elite plans include PT sessions — ask your coach to book one.
            </EmptyState>
          )}
        </Card>

        <Card title="Body weight" action={<Link href="/dashboard/progress" className="text-xs text-volt hover:underline">Progress</Link>}>
          {latest ? (
            <>
              <div className="flex items-end justify-between">
                <p className="display text-5xl">
                  {latest.weight_kg}
                  <span className="text-lg text-smoke"> kg</span>
                </p>
                <p className={`flex items-center gap-1 text-sm ${delta <= 0 ? "text-ok" : "text-warn"}`}>
                  {delta <= 0 ? <TrendingDown className="size-4" /> : <TrendingUp className="size-4" />}
                  {delta > 0 ? "+" : ""}
                  {delta.toFixed(1)} kg
                </p>
              </div>
              <WeightSparkline data={measurements.map((m) => ({ date: m.measured_on, weight: Number(m.weight_kg) }))} />
            </>
          ) : (
            <EmptyState title="No measurements yet" action={<Link href="/dashboard/progress" className="text-sm text-volt hover:underline">Log your first →</Link>} />
          )}
        </Card>
      </div>

      <Card title="Notifications" className="mt-4">
        {notifications.length ? (
          <ul className="divide-y divide-white/[0.06]">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start gap-3 py-3">
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read_at ? "bg-ash" : "bg-volt"}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-sm text-smoke">{n.body}</p>
                </div>
                <time className="shrink-0 font-mono text-[0.7rem] text-ash">{formatDate(n.created_at, { day: "numeric", month: "short" })}</time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-smoke">You&apos;re all caught up.</p>
        )}
      </Card>

      <Link href="/calculators" className="group mt-4 flex items-center justify-between rounded-[var(--radius-card)] border border-volt/20 bg-volt/5 p-5">
        <span>
          <span className="block font-semibold">Recalculate your targets</span>
          <span className="text-sm text-smoke">BMI, BMR and calorie calculators</span>
        </span>
        <ArrowUpRight className="size-5 text-volt transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </>
  );
}
