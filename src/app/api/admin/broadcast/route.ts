import { z } from "zod";
import { ApiError, assertSameOrigin, authorize, handler, limit, ok, parseBody } from "@/lib/api";
import { STAFF_ROLES } from "@/lib/auth/session";
import { getRepo, eq, gte, inList } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { toISODate } from "@/lib/utils";

const schema = z.object({
  audience: z.enum(["active", "all", "expiring"]),
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(5).max(1000),
  channels: z.array(z.enum(["in_app", "email", "whatsapp", "sms"])).min(1),
});

export const POST = handler(async (req) => {
  await assertSameOrigin(req);
  await authorize(STAFF_ROLES);
  await limit("broadcast", 5, 60 * 60_000);
  const input = await parseBody(req, schema);
  const repo = await getRepo("user");
  const today = toISODate(new Date());

  let memberIds: string[] | null = null;
  if (input.audience !== "all") {
    const ms = await repo.list("memberships", { filters: [eq("status", "active"), gte("end_date", today)] });
    const soon = toISODate(new Date(Date.now() + 7 * 86_400_000));
    memberIds = [...new Set(ms.filter((m) => input.audience === "active" || m.end_date <= soon).map((m) => m.member_id))];
    if (!memberIds.length) throw new ApiError(422, "No members match that audience.");
  }
  const members = await repo.list("members", { filters: memberIds ? [inList("id", memberIds)] : [] });
  const users = await repo.list("users", { filters: [inList("id", members.map((m) => m.user_id))] });

  let sent = 0;
  for (const u of users) {
    const r = await notify("admin_alert", { userId: u.id, email: u.email, phone: u.phone }, { title: input.title, body: input.body }, input.channels);
    sent += r.failed ? 0 : 1;
  }
  return ok({ recipients: users.length, sent });
});
