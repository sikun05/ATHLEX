import { CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getPtSessions, getUpcomingClasses } from "@/lib/dashboard";
import { Card, PageHeader } from "@/components/dashboard/ui";
import { NoMemberProfile } from "@/components/dashboard/no-member";
import { CancelBooking } from "@/components/dashboard/cancel-booking";
import { Badge, EmptyState, statusTone } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Classes & Sessions" };

export default async function ClassesPage() {
  const user = await requireUser();
  if (!user.memberId) return <NoMemberProfile />;
  const [classes, pt] = await Promise.all([getUpcomingClasses(user.memberId, 30), getPtSessions(user.memberId)]);
  return (
    <>
      <PageHeader eyebrow="Schedule" title="Classes & sessions" actions={<ButtonLink href="/schedule" size="sm" arrow>Book a class</ButtonLink>} />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Upcoming classes" className="xl:col-span-2">
          {classes.length ? (
            <ul className="divide-y divide-white/[0.06]">
              {classes.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-4 py-4">
                  <div className="w-14 text-center">
                    <p className="font-mono text-[0.6rem] uppercase text-smoke">{formatDate(c.date, { weekday: "short" })}</p>
                    <p className="display text-3xl">{formatDate(c.date, { day: "2-digit" })}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{c.className}</p>
                    <p className="text-sm text-smoke">
                      {c.start}–{c.end} · {c.trainer} · {c.room}
                    </p>
                  </div>
                  <CancelBooking id={c.id} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<CalendarDays className="size-5" />} title="Nothing booked yet" action={<ButtonLink href="/schedule" size="sm">View timetable</ButtonLink>}>
              Reserve a spot in any class up to 14 days ahead.
            </EmptyState>
          )}
        </Card>
        <Card title="Personal training">
          <ul className="space-y-3">
            {pt.map((p) => (
              <li key={p.id} className="rounded-md bg-graphite p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{formatDate(p.session_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>
                  <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-smoke">
                  {p.trainer} · {p.duration_min} min
                </p>
                {p.notes && <p className="mt-2 text-sm text-bone/70">{p.notes}</p>}
              </li>
            ))}
            {!pt.length && <li className="text-sm text-smoke">No sessions yet.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}
