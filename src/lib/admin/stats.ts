import "server-only";
import { getRepo, gte, lte, eq, inList, type Row } from "@/lib/db";
import { addDays, toISODate } from "@/lib/utils";

const monthKey = (d: string | Date) => toISODate(new Date(d)).slice(0, 7);
const monthLabel = (key: string) => new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(`${key}-01T00:00:00`));

/** Dashboard KPIs for staff. Runs under the caller's session (RLS: staff/admin). */
export async function getAdminOverview() {
  const repo = await getRepo("user");
  const now = new Date();
  const today = toISODate(now);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const monthStart = `${today.slice(0, 7)}-01`;
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [directory, memberships, payments, trials, todayAttendance, recentAttendance] = await Promise.all([
    repo.list("member_directory", { order: [{ col: "created_at", asc: false }] }),
    repo.list("memberships", { filters: [gte("end_date", toISODate(addDays(now, -1)))] }),
    repo.list("payments", { filters: [gte("created_at", sixMonthsAgo.toISOString())], order: [{ col: "created_at", asc: false }] }),
    repo.list("trial_bookings", { order: [{ col: "created_at", asc: false }], limit: 50 }),
    repo.list("attendance", { filters: [gte("check_in_at", startOfDay.toISOString())] }),
    repo.list("attendance", { filters: [gte("check_in_at", addDays(startOfDay, -13).toISOString())] }),
  ]);

  const activeMemberIds = new Set(memberships.filter((m) => m.status === "active" && m.start_date <= today && m.end_date >= today).map((m) => m.member_id));
  const expiring = memberships
    .filter((m) => m.status === "active" && m.end_date >= today && m.end_date <= toISODate(addDays(now, 7)))
    // Skip members who already renewed (a later membership exists)
    .filter((m) => !memberships.some((x) => x.member_id === m.member_id && x.id !== m.id && x.start_date > m.end_date && x.status === "active"));

  const paid = payments.filter((p) => p.status === "paid");
  const revenueThisMonth = paid.filter((p) => (p.paid_at ?? p.created_at) >= monthStart).reduce((s, p) => s + p.amount_paise, 0);
  const pending = payments.filter((p) => p.status === "created");

  // Revenue by month (6 months)
  const months = Array.from({ length: 6 }, (_, i) => monthKey(new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)));
  const revenueByMonth = months.map((k) => ({ month: monthLabel(k), revenue: Math.round(paid.filter((p) => monthKey(p.paid_at ?? p.created_at) === k).reduce((s, p) => s + p.amount_paise, 0) / 100) }));
  const newByMonth = months.map((k) => ({ month: monthLabel(k), members: directory.filter((d) => monthKey(d.created_at) === k).length }));

  // Attendance per day (14 days)
  const attendanceByDay = Array.from({ length: 14 }, (_, i) => {
    const d = toISODate(addDays(startOfDay, -13 + i));
    return { day: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(`${d}T00:00:00`)), visits: recentAttendance.filter((a) => toISODate(new Date(a.check_in_at)) === d).length };
  });

  const byId = Object.fromEntries(directory.map((d) => [d.id, d]));

  return {
    kpis: {
      totalMembers: directory.length,
      activeMembers: activeMemberIds.size,
      newMembers: directory.filter((d) => d.created_at >= addDays(now, -30).toISOString()).length,
      trialBookings: trials.filter((t) => t.status === "new" || (t.status === "confirmed" && t.preferred_date >= today)).length,
      todaysAttendance: new Set(todayAttendance.map((a) => a.member_id)).size,
      onFloor: todayAttendance.filter((a) => !a.check_out_at).length,
      revenueThisMonth,
      pendingPayments: pending.length,
      pendingAmount: pending.reduce((s, p) => s + p.amount_paise, 0),
      expiringSoon: expiring.length,
    },
    revenueByMonth,
    newByMonth,
    attendanceByDay,
    expiring: expiring.sort((a, b) => a.end_date.localeCompare(b.end_date)).map((m) => ({ ...m, member: byId[m.member_id] }) as Row),
    trials: trials.slice(0, 6),
    recentPayments: payments.slice(0, 6).map((p) => ({ ...p, member: byId[p.member_id] }) as Row),
  };
}

export async function getReports(fromISO: string, toISO: string) {
  const repo = await getRepo("user");
  const [payments, plans, attendance] = await Promise.all([
    repo.list("payments", { filters: [eq("status", "paid"), gte("paid_at", fromISO), lte("paid_at", toISO)] }),
    repo.list("membership_plans", { includeDeleted: true }),
    repo.list("attendance", { filters: [gte("check_in_at", fromISO), lte("check_in_at", toISO)] }),
  ]);
  const byPlan = plans
    .map((p) => {
      const ps = payments.filter((x) => x.plan_id === p.id);
      return { plan: p.name as string, sales: ps.length, revenue: Math.round(ps.reduce((s, x) => s + x.amount_paise, 0) / 100) };
    })
    .filter((r) => r.sales > 0);
  const byHour = Array.from({ length: 18 }, (_, i) => {
    const h = i + 5;
    return { hour: `${((h + 11) % 12) + 1}${h < 12 ? "a" : "p"}`, visits: attendance.filter((a) => new Date(a.check_in_at).getHours() === h).length };
  });
  const byMethod = Object.entries(payments.reduce<Record<string, number>>((m, p) => ((m[p.method ?? "other"] = (m[p.method ?? "other"] ?? 0) + p.amount_paise), m), {})).map(([method, v]) => ({
    method: method.toUpperCase(),
    revenue: Math.round(v / 100),
  }));
  const totalRevenue = payments.reduce((s, p) => s + p.amount_paise, 0);
  const uniqueVisitors = new Set(attendance.map((a) => a.member_id)).size;
  return { byPlan, byHour, byMethod, totalRevenue, sales: payments.length, visits: attendance.length, uniqueVisitors, avgOrder: payments.length ? totalRevenue / payments.length : 0 };
}

/** Resolve relation labels for a set of rows (id → label per column). */
export async function resolveRelations(rows: Row[], columns: { key: string; relation?: { table: string; label: string } }[]) {
  const repo = await getRepo("user");
  const out: Record<string, Record<string, string>> = {};
  await Promise.all(
    columns
      .filter((c) => c.relation)
      .map(async (c) => {
        const ids = [...new Set(rows.map((r) => r[c.key]).filter(Boolean))];
        if (!ids.length) return;
        const rel = await repo.list(c.relation!.table, { filters: [inList("id", ids)], includeDeleted: true });
        out[c.key] = Object.fromEntries(rel.map((r) => [r.id, String(r[c.relation!.label] ?? "").slice(0, 60)]));
      }),
  );
  return out;
}

/** Options for relation <select>s in forms. */
export async function relationOptions(fields: { name: string; relation?: { table: string; label: string } }[]) {
  const repo = await getRepo("user");
  const out: Record<string, { value: string; label: string }[]> = {};
  await Promise.all(
    fields
      .filter((f) => f.relation)
      .map(async (f) => {
        const rows = await repo.list(f.relation!.table, { order: [{ col: f.relation!.label }], limit: 1000 });
        out[f.name] = rows.map((r) => ({ value: r.id, label: String(r[f.relation!.label] ?? r.id) + (r.member_code ? ` · ${r.member_code}` : "") }));
      }),
  );
  return out;
}
