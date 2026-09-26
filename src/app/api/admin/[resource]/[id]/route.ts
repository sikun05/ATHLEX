import { ApiError, assertSameOrigin, authorize, handler, ok, parseBody } from "@/lib/api";
import { getResource } from "@/lib/admin/resources";
import { buildSchema } from "@/lib/admin/schema";
import { getRepo } from "@/lib/db";

function resolve(slug: string) {
  const r = getResource(slug);
  if (!r) throw new ApiError(404, "Unknown module");
  return r;
}

export const PATCH = handler(async (req, ctx: RouteContext<"/api/admin/[resource]/[id]">) => {
  await assertSameOrigin(req);
  const { resource, id } = await ctx.params;
  const res = resolve(resource);
  const actor = await authorize(res.write);
  const data = await parseBody(req, buildSchema(res.fields, "update"));
  if (res.table === "users" && id === actor.id && data.role && data.role !== actor.role) {
    throw new ApiError(400, "You can't change your own role.");
  }
  const repo = await getRepo("user");
  const existing = await repo.get(res.table, id);
  if (!existing) throw new ApiError(404, "Record not found");
  try {
    return ok(await repo.update(res.table, id, data));
  } catch (e) {
    const msg = (e as Error).message;
    if (/duplicate|unique/i.test(msg)) throw new ApiError(409, "Another record already uses that slug/code.");
    if (/row-level security|permission|Only admins/i.test(msg)) throw new ApiError(403, "You don't have permission to do that.");
    throw e;
  }
});

export const DELETE = handler(async (req, ctx: RouteContext<"/api/admin/[resource]/[id]">) => {
  await assertSameOrigin(req);
  const { resource, id } = await ctx.params;
  const res = resolve(resource);
  const actor = await authorize(res.write);
  if (res.remove === false) throw new ApiError(405, `${res.title} can't be deleted.`);
  if (res.table === "users" && id === actor.id) throw new ApiError(400, "You can't delete your own account.");
  const repo = await getRepo("user");
  await repo.remove(res.table, id);
  return ok({ deleted: true });
});
