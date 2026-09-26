import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getRepo, eq, inList } from "@/lib/db";
import { isServiceRoleConfigured, isSupabaseConfigured } from "@/lib/env";
import { notify } from "@/lib/notifications";
import { addDays, formatDate, toISODate } from "@/lib/utils";

/**
 * Daily job (vercel.json cron): expire memberships, send expiry reminders
 * and tomorrow's class reminders. Protected by CRON_SECRET.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!secret || given.length !== secret.length || !timingSafeEqual(Buffer.from(given), Buffer.from(secret))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (isSupabaseConfigured() && !isServiceRoleConfigured()) return NextResponse.json({ ok: false, error: "service role missing" }, { status: 503 });

  const repo = await getRepo("privileged");
  const today = toISODate(new Date());

  // 1. Expire
  const expired = await repo.updateWhere("memberships", [eq("status", "active"), { col: "end_date", op: "lt", value: today }], { status: "expired" });

  // 2. Expiry reminders (7, 3, 1 days out)
  const settings = await repo.get("settings", "notifications", "key");
  const days: number[] = settings?.value?.expiry_reminder_days ?? [7, 3, 1];
  const targets = days.map((d) => toISODate(addDays(new Date(), d)));
  const expiring = await repo.list("memberships", { filters: [eq("status", "active"), inList("end_date", targets)] });
  let expiryReminders = 0;
  for (const m of expiring) {
    const renewed = await repo.list("memberships", { filters: [eq("member_id", m.member_id), { col: "start_date", op: "gt", value: m.end_date }] });
    if (renewed.length) continue;
    const member = await repo.get("members", m.member_id);
    const user = member ? await repo.get("users", member.user_id) : null;
    const plan = await repo.get("membership_plans", m.plan_id);
    if (!user) continue;
    await notify("membership_expiry", { userId: user.id, email: user.email, phone: user.phone }, { name: user.full_name, plan: plan?.name, end: formatDate(m.end_date), days: Math.round((new Date(m.end_date).getTime() - Date.now()) / 86_400_000) + 1 });
    expiryReminders++;
  }

  // 3. Class reminders for tomorrow
  const tomorrow = toISODate(addDays(new Date(), 1));
  const bookings = await repo.list("class_bookings", { filters: [eq("class_date", tomorrow), eq("status", "booked")] });
  for (const b of bookings) {
    const s = await repo.get("class_schedules", b.schedule_id);
    const c = s ? await repo.get("classes", s.class_id) : null;
    const member = await repo.get("members", b.member_id);
    const user = member ? await repo.get("users", member.user_id) : null;
    if (user) await notify("class_reminder", { userId: user.id, email: user.email, phone: user.phone }, { className: c?.name, time: String(s?.start_time ?? "").slice(0, 5), date: formatDate(tomorrow, { weekday: "long" }) }, ["whatsapp", "in_app"]);
  }

  return NextResponse.json({ ok: true, expired: expired.length, expiryReminders, classReminders: bookings.length });
}
