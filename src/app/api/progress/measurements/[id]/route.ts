import { ApiError, assertSameOrigin, authorize, handler, ok } from "@/lib/api";
import { getRepo } from "@/lib/db";

export const DELETE = handler(async (req, ctx: RouteContext<"/api/progress/measurements/[id]">) => {
  await assertSameOrigin(req);
  const user = await authorize();
  const { id } = await ctx.params;
  const repo = await getRepo("user");
  const row = await repo.get("body_measurements", id);
  if (!row || row.member_id !== user.memberId) throw new ApiError(404, "Not found");
  await repo.remove("body_measurements", id);
  return ok({ deleted: true });
});
