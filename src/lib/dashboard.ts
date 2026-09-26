import "server-only";
import { cache } from "react";
import { getRepo, eq, gte, inList, type Row } from "@/lib/db";
import { getActiveMembership } from "@/lib/members";
import { addDays, toISODate } from "@/lib/utils";

/**
 * Member-scoped reads. Every query filters by the caller's member id; in
 * Supabase mode RLS enforces the same rule a second time.
 */

export const getUpcomingClasses = cache(async (memberId: string, limit = 10) => {
  const repo = await getRepo("user");
  const bookings = await repo.list("class_bookings", {
    filters: [eq("member_id", memberId), eq("status", "booked"), gte("class_date", toISODate(new Date()))],
    order: [{ col: "class_date" }],
    limit,
  });
  if (!bookings.length) return [];
  const schedules = await repo.list("class_schedules", { filters: [inList("id", [...new Set(bookings.map((b) => b.schedule_id))])] });
  const classes = await repo.list("classes", { filters: [inList("id", [...new Set(schedules.map((s) => s.class_id))])] });
  const trainers = await repo.list("trainers", { filters: [inList("id", [...new Set(schedules.map((s) => s.trainer_id).filter(Boolean))])] });
  return bookings
    .map((b) => {
      const s = schedules.find((x) => x.id === b.schedule_id);
      const c = classes.find((x) => x.id === s?.class_id);
      const t = trainers.find((x) => x.id === s?.trainer_id);
      return { id: b.id as string, date: b.class_date as string, start: String(s?.start_time ?? "").slice(0, 5), end: String(s?.end_time ?? "").slice(0, 5), room: s?.room as string, className: c?.name as string, category: c?.category as string, trainer: t?.name as string };
    })
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
});

export const getPtSessions = cache(async (memberId: string) => {
  const repo = await getRepo("user");
  const rows = await repo.list("personal_training", { filters: [eq("member_id", memberId)], order: [{ col: "session_at" }] });
  const trainers = await repo.list("trainers", { filters: [inList("id", [...new Set(rows.map((r) => r.trainer_id))])] });
  return rows.map((r): Row => ({ ...r, trainer: trainers.find((t) => t.id === r.trainer_id)?.name ?? "Coach" }));
});

export const getAttendance = cache(async (memberId: string, days = 90) => {
  const repo = await getRepo("user");
  return repo.list("attendance", {
    filters: [eq("member_id", memberId), gte("check_in_at", addDays(new Date(), -days).toISOString())],
    order: [{ col: "check_in_at", asc: false }],
  });
});

export function attendanceStats(rows: Row[]) {
  const days = new Set(rows.map((r) => toISODate(new Date(r.check_in_at))));
  const now = new Date();
  const monthKey = toISODate(now).slice(0, 7);
  const thisMonth = [...days].filter((d) => d.startsWith(monthKey)).length;
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = toISODate(addDays(now, -i));
    if (days.has(d)) streak++;
    else if (i > 0) break;
  }
  const last30 = [...days].filter((d) => d >= toISODate(addDays(now, -30))).length;
  return { thisMonth, streak, last30, total: days.size, days };
}

export const getWorkoutPlan = cache(async (memberId: string) => {
  const repo = await getRepo("user");
  const plan = await repo.findOne("workout_plans", [eq("member_id", memberId), eq("status", "active")]);
  if (!plan) return null;
  const [exercises, trainer] = await Promise.all([
    repo.list("workout_exercises", { filters: [eq("workout_plan_id", plan.id)], order: [{ col: "sort_order" }] }),
    plan.trainer_id ? repo.get("trainers", plan.trainer_id) : null,
  ]);
  return { plan, exercises, trainer };
});

export const getDietPlan = cache(async (memberId: string) => {
  const repo = await getRepo("user");
  const plan = await repo.findOne("diet_plans", [eq("member_id", memberId), eq("status", "active")]);
  if (!plan) return null;
  const [meals, trainer] = await Promise.all([
    repo.list("diet_meals", { filters: [eq("diet_plan_id", plan.id)], order: [{ col: "sort_order" }] }),
    plan.trainer_id ? repo.get("trainers", plan.trainer_id) : null,
  ]);
  return { plan, meals, trainer };
});

export const getMeasurements = cache(async (memberId: string) => {
  const repo = await getRepo("user");
  return repo.list("body_measurements", { filters: [eq("member_id", memberId)], order: [{ col: "measured_on" }] });
});

export const getProgressPhotos = cache(async (memberId: string) => {
  const repo = await getRepo("user");
  const rows = await repo.list("progress_photos", { filters: [eq("member_id", memberId)], order: [{ col: "taken_on", asc: false }] });
  // Private bucket → short-lived signed URLs (Supabase); demo stores data URLs.
  if (repo.kind === "supabase" && rows.length) {
    const { getServerSupabase } = await import("@/lib/supabase/server");
    const sb = await getServerSupabase();
    const { data } = await sb.storage.from("progress-photos").createSignedUrls(rows.map((r) => r.storage_path), 3600);
    return rows.map((r, i): Row => ({ ...r, url: data?.[i]?.signedUrl ?? null }));
  }
  return rows.map((r): Row => ({ ...r, url: r.storage_path }));
});

export const getPayments = cache(async (userId: string) => {
  const repo = await getRepo("user");
  const rows = await repo.list("payments", { filters: [eq("user_id", userId)], order: [{ col: "created_at", asc: false }] });
  const plans = await repo.list("membership_plans", { includeDeleted: true });
  return rows.map((r): Row => ({ ...r, plan_name: plans.find((p) => p.id === r.plan_id)?.name ?? "—" }));
});

export const getNotifications = cache(async (userId: string, limit = 8) => {
  const repo = await getRepo("user");
  return repo.list("notifications", { filters: [eq("user_id", userId)], order: [{ col: "created_at", asc: false }], limit });
});

export const getMemberOverview = cache(async (memberId: string, userId: string) => {
  const [membership, classes, pt, attendance, measurements, notifications] = await Promise.all([
    getActiveMembership(memberId),
    getUpcomingClasses(memberId, 4),
    getPtSessions(memberId),
    getAttendance(memberId, 60),
    getMeasurements(memberId),
    getNotifications(userId, 5),
  ]);
  const upcomingPt = pt.filter((p) => p.status === "scheduled" && new Date(p.session_at) >= new Date()).slice(0, 3);
  return { membership, classes, upcomingPt, attendance, stats: attendanceStats(attendance), measurements, notifications };
});
