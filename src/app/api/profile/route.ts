import { assertSameOrigin, authorize, handler, ok, parseBody } from "@/lib/api";
import { getRepo } from "@/lib/db";
import { profileSchema } from "@/lib/validation";

const orNull = (v: unknown) => (v === "" || v === undefined ? null : v);

export const PATCH = handler(async (req) => {
  await assertSameOrigin(req);
  const user = await authorize();
  const input = await parseBody(req, profileSchema);
  const repo = await getRepo("user");
  await repo.update("users", user.id, { full_name: input.fullName, phone: input.phone });
  if (user.memberId) {
    await repo.update("members", user.memberId, {
      date_of_birth: orNull(input.dateOfBirth),
      gender: orNull(input.gender),
      height_cm: orNull(input.heightCm),
      fitness_goal: orNull(input.fitnessGoal),
      emergency_contact_name: orNull(input.emergencyContactName),
      emergency_contact_phone: orNull(input.emergencyContactPhone),
      address: orNull(input.address),
    });
  }
  return ok({ saved: true });
});
