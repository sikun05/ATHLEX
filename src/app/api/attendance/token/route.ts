import { ApiError, authorize, handler, ok } from "@/lib/api";
import { issueAttendanceToken } from "@/lib/attendance";
import { getActiveMembership } from "@/lib/members";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const user = await authorize();
  if (!user.memberId) throw new ApiError(400, "No member profile on this account.");
  const active = await getActiveMembership(user.memberId);
  return ok({ ...issueAttendanceToken(user.memberId), active: Boolean(active) }, { headers: { "Cache-Control": "no-store" } });
});
