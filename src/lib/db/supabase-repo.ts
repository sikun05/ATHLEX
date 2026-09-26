import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SOFT_DELETE, type Filter, type ListOptions, type Repo, type Row } from "./types";

type Q = ReturnType<ReturnType<SupabaseClient["from"]>["select"]>;

function applyFilters(q: Q, filters: Filter[] = []): Q {
  for (const f of filters) {
    switch (f.op) {
      case "in":
        q = q.in(f.col, f.value);
        break;
      case "is":
        q = q.is(f.col, null);
        break;
      case "not_null":
        q = q.not(f.col, "is", null);
        break;
      default:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        q = (q as any)[f.op](f.col, f.value);
    }
  }
  return q;
}

const VIEWS = new Set(["member_directory"]);

function build(sb: SupabaseClient, table: string, opts: ListOptions, head = false) {
  let q = sb.from(table).select(opts.select ?? "*", head ? { count: "exact", head: true } : undefined) as Q;
  q = applyFilters(q, opts.filters);
  if (!opts.includeDeleted && (SOFT_DELETE.has(table) || VIEWS.has(table))) q = q.is("deleted_at", null);
  if (opts.search?.q) {
    const term = opts.search.q.replace(/[%,()]/g, " ").trim();
    if (term) q = q.or(opts.search.cols.map((c) => `${c}.ilike.%${term}%`).join(","));
  }
  return q;
}

export function supabaseRepo(sb: SupabaseClient): Repo {
  return {
    kind: "supabase",
    async list(table, opts = {}) {
      let q = build(sb, table, opts);
      for (const o of opts.order ?? []) q = q.order(o.col, { ascending: o.asc !== false });
      if (opts.limit) q = q.range(opts.offset ?? 0, (opts.offset ?? 0) + opts.limit - 1);
      const { data, error } = await q;
      if (error) throw new Error(`${table}: ${error.message}`);
      return (data ?? []) as never;
    },
    async count(table, opts = {}) {
      const { count, error } = await build(sb, table, opts, true);
      if (error) throw new Error(`${table}: ${error.message}`);
      return count ?? 0;
    },
    async get(table, id, idCol = "id") {
      const { data, error } = await sb.from(table).select("*").eq(idCol, id).maybeSingle();
      if (error) throw new Error(`${table}: ${error.message}`);
      return data as never;
    },
    async findOne(table, filters) {
      const { data, error } = await applyFilters(sb.from(table).select("*") as Q, filters).limit(1).maybeSingle();
      if (error) throw new Error(`${table}: ${error.message}`);
      return data as never;
    },
    async insert(table, row, opts) {
      if (opts?.returning === false) {
        const { error } = await sb.from(table).insert(row as Row);
        if (error) throw new Error(`${table}: ${error.message}`);
        return row as never;
      }
      const { data, error } = await sb.from(table).insert(row as Row).select("*").single();
      if (error) throw new Error(`${table}: ${error.message}`);
      return data as never;
    },
    async update(table, id, patch, idCol = "id") {
      const { data, error } = await sb.from(table).update(patch as Row).eq(idCol, id).select("*").single();
      if (error) throw new Error(`${table}: ${error.message}`);
      return data as never;
    },
    async updateWhere(table, filters, patch) {
      // Single UPDATE ... WHERE → atomic in Postgres (safe for payment state transitions).
      let q = sb.from(table).update(patch as Row) as unknown as Q;
      q = applyFilters(q, filters);
      const { data, error } = await (q as unknown as Q).select("*");
      if (error) throw new Error(`${table}: ${error.message}`);
      return (data ?? []) as never;
    },
    async remove(table, id, idCol = "id") {
      const { error } = SOFT_DELETE.has(table)
        ? await sb.from(table).update({ deleted_at: new Date().toISOString() }).eq(idCol, id)
        : await sb.from(table).delete().eq(idCol, id);
      if (error) throw new Error(`${table}: ${error.message}`);
    },
  };
}
