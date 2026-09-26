import { ApiError, assertSameOrigin, authorize, handler, ok, parseBody } from "@/lib/api";
import { getRepo } from "@/lib/db";
import { measurementSchema } from "@/lib/validation";

const num = (v: unknown) => (v === "" || v === undefined || v === null ? null : Number(v));

export const POST = handler(async (req) => {
  await assertSameOrigin(req);
  const user = await authorize();
  if (!user.memberId) throw new ApiError(400, "No member profile");
  const input = await parseBody(req, measurementSchema);
  const repo = await getRepo("user");
  const member = await repo.get("members", user.memberId);
  const h = Number(member?.height_cm) || null;
  const row = await repo.insert("body_measurements", {
    member_id: user.memberId,
    measured_on: input.measuredOn,
    weight_kg: input.weightKg,
    bmi: h ? Number((Number(input.weightKg) / (h / 100) ** 2).toFixed(1)) : null,
    body_fat_pct: num(input.bodyFatPct),
    chest_cm: num(input.chestCm),
    waist_cm: num(input.waistCm),
    hips_cm: num(input.hipsCm),
    arms_cm: num(input.armsCm),
    thighs_cm: num(input.thighsCm),
    notes: input.notes || null,
  });
  return ok(row, { status: 201 });
});
