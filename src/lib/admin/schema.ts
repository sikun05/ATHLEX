import { z } from "zod";
import type { FieldDef } from "./resources";

/** Build a zod schema from field definitions — shared by the admin form and the API (allow-list). */
export function buildSchema(fields: FieldDef[], mode: "create" | "update") {
  const shape: Record<string, z.ZodType> = {};
  for (const f of fields) {
    let s: z.ZodType;
    const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);
    switch (f.type) {
      case "number":
        s = z.preprocess(emptyToNull, z.coerce.number().int().min(f.min ?? -1e9).max(f.max ?? 1e9).nullable());
        break;
      case "money":
        s = z.preprocess(emptyToNull, z.coerce.number().min(0).max(1e7).transform((r) => Math.round(r * 100)).nullable());
        break;
      case "boolean":
        s = z.preprocess((v) => v === true || v === "true" || v === "on", z.boolean());
        break;
      case "tags":
        s = z.preprocess(
          (v) => (Array.isArray(v) ? v : String(v ?? "").split(",")).map((x: string) => String(x).trim()).filter(Boolean),
          z.array(z.string().max(200)).max(50),
        );
        break;
      case "date":
        s = z.preprocess(emptyToNull, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD").nullable());
        break;
      case "time":
        s = z.preprocess(emptyToNull, z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Use HH:MM").nullable());
        break;
      case "datetime":
        s = z.preprocess(
          (v) => (v === "" || v == null ? null : new Date(String(v)).toISOString()),
          z.string().nullable(),
        );
        break;
      case "select":
        s = z.preprocess(emptyToNull, z.enum(f.options as [string, ...string[]]).nullable());
        break;
      case "relation":
        s = z.preprocess(emptyToNull, z.uuid("Choose an option").nullable());
        break;
      case "url":
        s = z.preprocess(emptyToNull, z.url("Enter a valid URL").max(2000).nullable());
        break;
      case "email":
        s = z.preprocess(emptyToNull, z.email().nullable());
        break;
      default:
        s = z.preprocess((v) => (typeof v === "string" ? (v.trim() === "" ? null : v.trim()) : v ?? null), z.string().max(f.type === "textarea" ? 20000 : 500).nullable());
    }
    if (f.required && f.type !== "boolean" && f.type !== "tags") {
      s = s.refine((v) => v !== null && v !== undefined, { message: `${f.label} is required` });
    }
    shape[f.name] = mode === "update" ? s.optional() : s;
  }
  return z.object(shape).strip();
}

const pad = (n: number) => String(n).padStart(2, "0");

/** DB row → form values */
export function toFormValues(fields: FieldDef[], row?: Record<string, unknown> | null) {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = row ? row[f.name] : f.default;
    if (v === null || v === undefined) out[f.name] = f.type === "boolean" ? false : "";
    else if (f.type === "money") out[f.name] = row ? Number(v) / 100 : v;
    else if (f.type === "tags") out[f.name] = Array.isArray(v) ? v.join(", ") : String(v);
    else if (f.type === "datetime") {
      const d = new Date(String(v));
      out[f.name] = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } else if (f.type === "time") out[f.name] = String(v).slice(0, 5);
    else out[f.name] = v;
  }
  return out;
}
