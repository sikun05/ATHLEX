import { assertSameOrigin, authorize, handler, ok } from "@/lib/api";
import { getRepo, eq, type Filter } from "@/lib/db";

export const POST = handler(async (req) => {
  await assertSameOrigin(req);
  const user = await authorize();
  const repo = await getRepo("user");
  const filters: Filter[] = [eq("user_id", user.id), { col: "read_at", op: "is", value: null }];
  const rows = await repo.updateWhere("notifications", filters, { read_at: new Date().toISOString(), status: "read" });
  return ok({ updated: rows.length });
});
