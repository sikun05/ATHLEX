import "server-only";
import { randomUUID } from "node:crypto";
import { buildDemoSeed } from "./demo-seed";
import { SOFT_DELETE, type Filter, type ListOptions, type Repo, type Row } from "./types";

/**
 * In-memory database used in DEMO MODE (no Supabase configured).
 * Lives on globalThis so it survives hot reloads; resets on server restart.
 */
const g = globalThis as unknown as { __athlexDemoDb?: Record<string, Row[]> };
export const demoDb = () => (g.__athlexDemoDb ??= buildDemoSeed());

const VIEWS: Record<string, () => Row[]> = {
  member_directory: () => {
    const db = demoDb();
    return db.members.map((m) => {
      const u = db.users.find((x) => x.id === m.user_id) ?? {};
      const ms = db.memberships.filter((x) => x.member_id === m.id).sort((a, b) => (a.end_date < b.end_date ? 1 : -1))[0];
      const plan = ms ? db.membership_plans.find((p) => p.id === ms.plan_id) : null;
      return {
        id: m.id,
        member_code: m.member_code,
        user_id: m.user_id,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone,
        gender: m.gender,
        fitness_goal: m.fitness_goal,
        assigned_trainer_id: m.assigned_trainer_id,
        joined_at: m.joined_at,
        status: m.status,
        membership_status: ms?.status ?? null,
        membership_end: ms?.end_date ?? null,
        plan_name: plan?.name ?? null,
        created_at: m.created_at,
        updated_at: m.updated_at,
        deleted_at: m.deleted_at,
      };
    });
  },
};

const cmp = (a: unknown, b: unknown) => {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  return a < b ? -1 : 1;
};

function match(row: Row, f: Filter): boolean {
  const v = row[f.col];
  switch (f.op) {
    case "eq":
      return v === f.value;
    case "neq":
      return v !== f.value;
    case "gt":
      return cmp(v, f.value) > 0;
    case "gte":
      return cmp(v, f.value) >= 0;
    case "lt":
      return cmp(v, f.value) < 0;
    case "lte":
      return cmp(v, f.value) <= 0;
    case "in":
      return f.value.includes(v);
    case "is":
      return v === null || v === undefined;
    case "not_null":
      return v !== null && v !== undefined;
  }
}

function rows(table: string): Row[] {
  if (VIEWS[table]) return VIEWS[table]();
  const db = demoDb();
  return (db[table] ??= []);
}

function query(table: string, opts: ListOptions = {}) {
  let out = rows(table).filter((r) => (opts.filters ?? []).every((f) => match(r, f)));
  if (!opts.includeDeleted && (SOFT_DELETE.has(table) || table in VIEWS)) out = out.filter((r) => !r.deleted_at);
  if (opts.search?.q) {
    const q = opts.search.q.toLowerCase();
    out = out.filter((r) => opts.search!.cols.some((c) => String(r[c] ?? "").toLowerCase().includes(q)));
  }
  for (const o of [...(opts.order ?? [])].reverse()) {
    out = [...out].sort((a, b) => cmp(a[o.col], b[o.col]) * (o.asc === false ? -1 : 1));
  }
  return out;
}

const clone = <T>(v: T): T => structuredClone(v);

export const demoRepo: Repo = {
  kind: "demo",
  async list(table, opts = {}) {
    const out = query(table, opts);
    const start = opts.offset ?? 0;
    return clone(out.slice(start, opts.limit ? start + opts.limit : undefined)) as never;
  },
  async count(table, opts = {}) {
    return query(table, opts).length;
  },
  async get(table, id, idCol = "id") {
    const r = rows(table).find((x) => x[idCol] === id);
    return r ? (clone(r) as never) : null;
  },
  async findOne(table, filters) {
    const r = query(table, { filters })[0];
    return r ? (clone(r) as never) : null;
  },
  async insert(table, row) {
    const now = new Date().toISOString();
    const rec: Row = { id: randomUUID(), created_at: now, updated_at: now, ...(SOFT_DELETE.has(table) ? { deleted_at: null } : {}), ...row };
    rows(table).push(rec);
    return clone(rec) as never;
  },
  async update(table, id, patch, idCol = "id") {
    const r = rows(table).find((x) => x[idCol] === id);
    if (!r) throw new Error(`${table}/${id} not found`);
    Object.assign(r, patch, { updated_at: new Date().toISOString() });
    return clone(r) as never;
  },
  async updateWhere(table, filters, patch) {
    // Synchronous filter+assign = atomic in a single-threaded runtime.
    const hit = rows(table).filter((r) => filters.every((f) => match(r, f)));
    const now = new Date().toISOString();
    hit.forEach((r) => Object.assign(r, patch, { updated_at: now }));
    return clone(hit) as never;
  },
  async remove(table, id, idCol = "id") {
    const list = rows(table);
    const idx = list.findIndex((x) => x[idCol] === id);
    if (idx === -1) return;
    if (SOFT_DELETE.has(table)) list[idx].deleted_at = new Date().toISOString();
    else list.splice(idx, 1);
  },
};
