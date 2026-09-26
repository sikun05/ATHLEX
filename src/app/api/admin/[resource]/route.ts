import { ApiError, assertSameOrigin, authorize, handler, ok, parseBody } from "@/lib/api";
import { getResource } from "@/lib/admin/resources";
import { buildSchema } from "@/lib/admin/schema";
import { getRepo, eq } from "@/lib/db";

export const dynamic = "force-dynamic";

function resolve(slug: string) {
  const r = getResource(slug);
  if (!r) throw new ApiError(404, "Unknown module");
  return r;
}

/** List (JSON) — used for CSV export and client refreshes. */
export const GET = handler(async (req, ctx: RouteContext<"/api/admin/[resource]">) => {
  const res = resolve((await ctx.params).resource);
  await authorize(res.read);
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const status = url.searchParams.get("status");
  const repo = await getRepo("user");
  const rows = await repo.list(res.listFrom ?? res.table, {
    filters: status && res.statusFilter ? [eq(res.statusFilter.col, status)] : [],
    search: q && res.search.length ? { cols: res.search, q } : undefined,
    order: [res.order],
    limit: 5000,
  });

  if (url.searchParams.get("format") === "csv") {
    const cols = res.columns.map((c) => c.key);
    const esc = (v: unknown) => {
      const s = v === null || v === undefined ? "" : Array.isArray(v) ? v.join("; ") : String(v);
      // Neutralise spreadsheet formula injection
      const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
      return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
    };
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
    return new Response(csv, {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${res.slug}-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" },
    });
  }
  return ok(rows);
});

export const POST = handler(async (req, ctx: RouteContext<"/api/admin/[resource]">) => {
  await assertSameOrigin(req);
  const res = resolve((await ctx.params).resource);
  await authorize(res.write);
  if (res.create === false) throw new ApiError(405, `${res.title} can't be created here.`);
  const data = await parseBody(req, buildSchema(res.fields, "create"));
  const repo = await getRepo("user");
  try {
    return ok(await repo.insert(res.table, data), { status: 201 });
  } catch (e) {
    const msg = (e as Error).message;
    if (/duplicate|unique/i.test(msg)) throw new ApiError(409, "A record with the same unique value (slug/code) already exists.");
    if (/row-level security|permission/i.test(msg)) throw new ApiError(403, "You don't have permission to do that.");
    throw e;
  }
});
