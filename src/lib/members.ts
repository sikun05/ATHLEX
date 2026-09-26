import "server-only";
import { getRepo, eq, gte, type Row } from "@/lib/db";
import { toISODate, daysBetween } from "@/lib/utils";

/** Current (latest active, non-expired) membership + plan for a member. */
export async function getActiveMembership(memberId: string, mode: "user" | "privileged" = "user") {
  const repo = await getRepo(mode);
  const rows = await repo.list("memberships", {
    filters: [eq("member_id", memberId), eq("status", "active"), gte("end_date", toISODate(new Date()))],
    order: [{ col: "start_date", asc: true }],
  });
  // Prefer the one running today; queued renewals come after.
  const today = toISODate(new Date());
  const current = rows.find((r) => r.start_date <= today) ?? rows[0] ?? null;
  if (!current) return null;
  const plan = await repo.get("membership_plans", current.plan_id);
  const lastEnd = rows.reduce((m, r) => (r.end_date > m ? r.end_date : m), current.end_date as string);
  return {
    ...(current as Row),
    start_date: current.start_date as string,
    plan_id: current.plan_id as string,
    plan,
    daysRemaining: Math.max(0, daysBetween(new Date(), new Date(`${lastEnd}T23:59:59`))),
    effectiveEnd: lastEnd,
    queued: rows.filter((r) => r.id !== current.id),
  };
}
