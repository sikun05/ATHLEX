import { z } from "zod";
import { assertSameOrigin, authorize, handler, ok, parseBody } from "@/lib/api";
import { getRepo } from "@/lib/db";

const schema = z.object({
  gym: z.object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().max(30),
    email: z.email(),
    gst_number: z.string().trim().max(20).optional().or(z.literal("")),
    attendance_window_minutes: z.coerce.number().int().min(1).max(10),
  }),
  notifications: z.object({
    email: z.boolean(),
    whatsapp: z.boolean(),
    sms: z.boolean(),
    reminder_hours_before_class: z.coerce.number().int().min(1).max(48),
    expiry_reminder_days: z.array(z.coerce.number().int().min(0).max(60)).max(5),
  }),
});

export const PUT = handler(async (req) => {
  await assertSameOrigin(req);
  await authorize(["admin"]);
  const input = await parseBody(req, schema);
  const repo = await getRepo("user");
  for (const [key, value] of Object.entries(input)) {
    const existing = await repo.get("settings", key, "key");
    if (existing) await repo.update("settings", key, { value }, "key");
    else await repo.insert("settings", { key, value });
  }
  return ok({ saved: true });
});
