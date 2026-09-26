import { assertSameOrigin, authorize, handler, ok, parseBody, ApiError } from "@/lib/api";
import { getRepo } from "@/lib/db";
import { checkoutProfileSchema } from "@/lib/validation";

/** Registration step: complete the member profile before payment. */
export const POST = handler(async (req) => {
  await assertSameOrigin(req);
  const user = await authorize();
  const input = await parseBody(req, checkoutProfileSchema);
  if (!user.memberId) throw new ApiError(400, "No member record found for this account.");
  const repo = await getRepo("user");
  await repo.update("users", user.id, { full_name: input.fullName, phone: input.phone });
  await repo.update("members", user.memberId, {
    date_of_birth: input.dateOfBirth,
    gender: input.gender,
    fitness_goal: input.fitnessGoal,
    emergency_contact_name: input.emergencyContactName,
    emergency_contact_phone: input.emergencyContactPhone,
  });
  return ok({ saved: true });
});
