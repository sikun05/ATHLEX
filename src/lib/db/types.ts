// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

export type Filter =
  | { col: string; op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte"; value: unknown }
  | { col: string; op: "in"; value: unknown[] }
  | { col: string; op: "is"; value: null }
  | { col: string; op: "not_null" };

export type ListOptions = {
  filters?: Filter[];
  order?: { col: string; asc?: boolean }[];
  limit?: number;
  offset?: number;
  /** Case-insensitive substring search across these columns */
  search?: { cols: string[]; q: string };
  includeDeleted?: boolean;
  select?: string;
};

export interface Repo {
  readonly kind: "supabase" | "demo";
  list<T extends Row = Row>(table: string, opts?: ListOptions): Promise<T[]>;
  count(table: string, opts?: ListOptions): Promise<number>;
  get<T extends Row = Row>(table: string, id: string, idCol?: string): Promise<T | null>;
  findOne<T extends Row = Row>(table: string, filters: Filter[]): Promise<T | null>;
  /** `returning: false` skips reading the row back (needed for insert-only RLS, e.g. anonymous leads). */
  insert<T extends Row = Row>(table: string, row: Row, opts?: { returning?: boolean }): Promise<T>;
  update<T extends Row = Row>(table: string, id: string, patch: Row, idCol?: string): Promise<T>;
  /** Conditional update (compare-and-set). Returns the rows that matched. */
  updateWhere<T extends Row = Row>(table: string, filters: Filter[], patch: Row): Promise<T[]>;
  /** Soft delete when the table supports it, otherwise hard delete */
  remove(table: string, id: string, idCol?: string): Promise<void>;
}

/** Tables that carry `deleted_at` (soft delete) */
export const SOFT_DELETE = new Set([
  "users", "members", "trainers", "membership_plans", "coupons", "classes", "progress_photos",
  "gallery", "testimonials", "offers", "blog_posts",
]);

export const eq = (col: string, value: unknown): Filter => ({ col, op: "eq", value });
export const inList = (col: string, value: unknown[]): Filter => ({ col, op: "in", value });
export const gte = (col: string, value: unknown): Filter => ({ col, op: "gte", value });
export const lte = (col: string, value: unknown): Filter => ({ col, op: "lte", value });
export const lt = (col: string, value: unknown): Filter => ({ col, op: "lt", value });
export const gt = (col: string, value: unknown): Filter => ({ col, op: "gt", value });
