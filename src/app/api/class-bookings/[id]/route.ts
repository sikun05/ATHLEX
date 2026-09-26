import { ApiError, assertSameOrigin, authorize, handler, ok } from "@/lib/api";
import { getRepo } from "@/lib/db";

/** Member cancels their own booking. */
export const DELETE = handler(async (req, ctx: RouteContext<"/api/class-bookings/[id]">) => {
  await assertSameOrigin(req);
  const user = await authorize();
  const { id } = await ctx.params;
  const repo = await getRepo("user");
  const b = await repo.get("class_bookings", id);
  if (!b || (b.member_id !== user.memberId && !["admin", "staff"].includes(user.role))) throw new ApiError(404, "Booking not found");
  if (b.status !== "booked") throw new ApiError(409, "This booking can no longer be cancelled.");
  await repo.update("class_bookings", id, { status: "cancelled" });
  return ok({ cancelled: true });
});
