import { ApiError, assertSameOrigin, authorize, handler, limit, ok, parseBody } from "@/lib/api";
import { getRepo, eq } from "@/lib/db";
import { getActiveMembership } from "@/lib/members";
import { notify } from "@/lib/notifications";
import { classBookingSchema } from "@/lib/validation";
import { formatDate, toISODate, addDays } from "@/lib/utils";

const MESSAGES: Record<string, [number, string]> = {
  NOT_A_MEMBER: [400, "Only members can book classes."],
  INVALID_DATE: [422, "You can book classes up to 14 days ahead."],
  NO_ACTIVE_MEMBERSHIP: [403, "You need an active membership to book classes."],
  CLASS_NOT_FOUND: [404, "That class no longer exists."],
  WRONG_DAY: [422, "That class doesn't run on the selected date."],
  CLASS_FULL: [409, "Sorry — this class is full."],
  ALREADY_BOOKED: [409, "You're already booked into this class."],
};

export const POST = handler(async (req) => {
  await assertSameOrigin(req);
  const user = await authorize();
  await limit("book", 30, 10 * 60_000);
  const { scheduleId, classDate } = await parseBody(req, classBookingSchema);
  const repo = await getRepo("user");

  let booking;
  if (repo.kind === "supabase") {
    // Atomic RPC: capacity lock + membership check + duplicate guard in one transaction.
    const { getServerSupabase } = await import("@/lib/supabase/server");
    const { data, error } = await (await getServerSupabase()).rpc("book_class", { p_schedule_id: scheduleId, p_class_date: classDate });
    if (error) {
      const code = Object.keys(MESSAGES).find((k) => error.message.includes(k));
      if (code) throw new ApiError(MESSAGES[code][0], MESSAGES[code][1], code);
      throw error;
    }
    booking = data;
  } else {
    // Demo mode mirrors the RPC's rules.
    const fail = (code: string) => {
      throw new ApiError(MESSAGES[code][0], MESSAGES[code][1], code);
    };
    if (!user.memberId) fail("NOT_A_MEMBER");
    const today = toISODate(new Date());
    if (classDate < today || classDate > toISODate(addDays(new Date(), 14))) fail("INVALID_DATE");
    const m = await getActiveMembership(user.memberId!);
    if (!m || m.effectiveEnd < classDate) fail("NO_ACTIVE_MEMBERSHIP");
    const sched = await repo.get("class_schedules", scheduleId);
    if (!sched || sched.status !== "active") fail("CLASS_NOT_FOUND");
    if ((new Date(`${classDate}T12:00:00`).getDay() + 6) % 7 !== sched!.day_of_week) fail("WRONG_DAY");
    const existing = await repo.list("class_bookings", { filters: [eq("schedule_id", scheduleId), eq("class_date", classDate)] });
    if (existing.some((b) => b.member_id === user.memberId && b.status === "booked")) fail("ALREADY_BOOKED");
    if (existing.filter((b) => b.status === "booked").length >= sched!.capacity) fail("CLASS_FULL");
    const cancelled = existing.find((b) => b.member_id === user.memberId);
    booking = cancelled
      ? await repo.update("class_bookings", cancelled.id, { status: "booked" })
      : await repo.insert("class_bookings", { schedule_id: scheduleId, member_id: user.memberId, class_date: classDate, status: "booked" });
  }

  const sched = await repo.get("class_schedules", scheduleId);
  const cls = sched ? await repo.get("classes", sched.class_id) : null;
  const trainer = sched?.trainer_id ? await repo.get("trainers", sched.trainer_id) : null;
  await notify(
    "booking_confirmation",
    { userId: user.id, email: user.email, phone: user.phone },
    { className: cls?.name, date: formatDate(classDate, { weekday: "short", day: "numeric", month: "short" }), time: String(sched?.start_time ?? "").slice(0, 5), trainer: trainer?.name ?? "your coach" },
    ["email", "in_app"],
  );
  return ok(booking, { status: 201 });
});
