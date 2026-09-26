import { ApiError, assertSameOrigin, authorize, handler, ok } from "@/lib/api";
import { getRepo } from "@/lib/db";

export const DELETE = handler(async (req, ctx: RouteContext<"/api/progress/photos/[id]">) => {
  await assertSameOrigin(req);
  const user = await authorize();
  const { id } = await ctx.params;
  const repo = await getRepo("user");
  const row = await repo.get("progress_photos", id);
  if (!row || row.member_id !== user.memberId) throw new ApiError(404, "Not found");
  if (repo.kind === "supabase") {
    const { getServerSupabase } = await import("@/lib/supabase/server");
    await (await getServerSupabase()).storage.from("progress-photos").remove([row.storage_path]);
  }
  await repo.remove("progress_photos", id);
  return ok({ deleted: true });
});
