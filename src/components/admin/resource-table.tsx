"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Download, Pencil, Plus, Search, Trash2, Inbox } from "lucide-react";
import { getResource, type ColumnDef, type FieldDef } from "@/lib/admin/resources";
import { buildSchema, toFormValues } from "@/lib/admin/schema";
import { api, applyFieldErrors } from "@/lib/client-api";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Badge, EmptyState, statusTone } from "@/components/ui/misc";
import { cn, formatDate, inr } from "@/lib/utils";

type Row = Record<string, unknown> & { id: string };
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ResourceTable({
  resource,
  rows: rawRows,
  editRows: rawEditRows,
  labels,
  options,
  total,
  page,
  pageSize,
  q,
  status,
  canWrite,
}: {
  resource: string;
  rows: Record<string, unknown>[];
  editRows: Record<string, Record<string, unknown>>;
  labels: Record<string, Record<string, string>>;
  options: Record<string, { value: string; label: string }[]>;
  total: number;
  page: number;
  pageSize: number;
  q: string;
  status: string;
  canWrite: boolean;
}) {
  const res = getResource(resource)!;
  const rows = rawRows as Row[];
  const editRows = rawEditRows as Record<string, Row>;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(q);
  const [editing, setEditing] = useState<Row | "new" | null>(null);

  const setParam = (patch: Record<string, string | null>) => {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    startTransition(() => router.push(`${pathname}?${sp.toString()}`));
  };

  // Debounced search
  useEffect(() => {
    if (search === q) return;
    const t = setTimeout(() => setParam({ q: search || null, page: null }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const exportHref = `/api/admin/${resource}?format=csv${q ? `&q=${encodeURIComponent(q)}` : ""}${status ? `&status=${status}` : ""}`;

  const remove = async (row: Row) => {
    if (!confirm(`Delete this ${res.singular}? This can't be undone from here.`)) return;
    try {
      await api(`/api/admin/${resource}/${row.id}`, { method: "DELETE" });
      toast.success(`${res.singular[0].toUpperCase()}${res.singular.slice(1)} deleted`);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className={cn("transition-opacity", pending && "opacity-60")}>
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        {res.search.length > 0 && (
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ash" aria-hidden />
            <label htmlFor="admin-search" className="sr-only">
              Search {res.title}
            </label>
            <input id="admin-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${res.title.toLowerCase()}…`} className="field h-11 py-0 pl-10" />
          </div>
        )}
        {res.statusFilter && (
          <>
            <label htmlFor="admin-status" className="sr-only">
              Filter by status
            </label>
            <select id="admin-status" value={status} onChange={(e) => setParam({ status: e.target.value || null, page: null })} className="field h-11 w-auto py-0 capitalize">
              <option value="">All {res.statusFilter.col.replace(/_/g, " ")}</option>
              {res.statusFilter.options.map((o) => (
                <option key={o} value={o}>
                  {o.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </>
        )}
        <div className="flex gap-2 sm:ml-auto">
          <a href={exportHref} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-xs font-semibold uppercase tracking-wider text-smoke hover:border-white/30 hover:text-bone">
            <Download className="size-4" /> CSV
          </a>
          {canWrite && res.create !== false && (
            <Button size="md" className="h-11" onClick={() => setEditing("new")}>
              <Plus className="size-4" /> New {res.singular}
            </Button>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<Inbox className="size-5" />} title={q || status ? "No results match your filters" : `No ${res.title.toLowerCase()} yet`}>
          {q || status ? "Try a different search or clear the filter." : canWrite && res.create !== false ? `Create the first ${res.singular} to get started.` : undefined}
        </EmptyState>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-[var(--radius-card)] border border-white/[0.07] md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-coal font-mono text-[0.6rem] uppercase tracking-[0.18em] text-smoke">
                <tr>
                  {res.columns.map((c) => (
                    <th key={c.key} scope="col" className="whitespace-nowrap px-4 py-3 font-normal">
                      {c.label || <span className="sr-only">{c.key}</span>}
                    </th>
                  ))}
                  {canWrite && (
                    <th className="px-4 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {rows.map((r) => (
                  <tr key={r.id} className="group hover:bg-white/[0.02]">
                    {res.columns.map((c) => (
                      <td key={c.key} className="max-w-[16rem] truncate px-4 py-3">
                        <Cell col={c} value={r[c.key]} labels={labels} />
                      </td>
                    ))}
                    {canWrite && (
                      <td className="px-4 py-2 text-right">
                        <RowActions onEdit={() => setEditing(editRows[r.id] ?? r)} onDelete={res.remove === false ? undefined : () => remove(r)} label={String(r[res.columns[1]?.key ?? "id"] ?? "")} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {rows.map((r) => (
              <li key={r.id} className="rounded-[var(--radius-card)] border border-white/[0.07] bg-coal p-4">
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  {res.columns
                    .filter((c) => c.type !== "image")
                    .map((c) => (
                      <div key={c.key} className="min-w-0">
                        <dt className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-ash">{c.label}</dt>
                        <dd className="truncate">
                          <Cell col={c} value={r[c.key]} labels={labels} />
                        </dd>
                      </div>
                    ))}
                </dl>
                {canWrite && (
                  <div className="mt-3 flex justify-end border-t border-white/[0.06] pt-3">
                    <RowActions onEdit={() => setEditing(editRows[r.id] ?? r)} onDelete={res.remove === false ? undefined : () => remove(r)} label="" />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Pagination */}
      <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm text-smoke">
        <p>
          {total === 0 ? "0" : `${(page - 1) * pageSize + 1}–${Math.min(total, page * pageSize)}`} of {total}
        </p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setParam({ page: String(page - 1) })} aria-label="Previous page" className="grid size-9 place-items-center rounded-full border border-white/10 disabled:opacity-30">
            <ChevronLeft className="size-4" />
          </button>
          <span className="grid h-9 place-items-center px-2 font-mono text-xs">
            {page} / {pages}
          </span>
          <button disabled={page >= pages} onClick={() => setParam({ page: String(page + 1) })} aria-label="Next page" className="grid size-9 place-items-center rounded-full border border-white/10 disabled:opacity-30">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </nav>

      {editing && (
        <RecordDialog
          resource={resource}
          fields={res.fields}
          row={editing === "new" ? null : editing}
          options={options}
          title={editing === "new" ? `New ${res.singular}` : `Edit ${res.singular}`}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function RowActions({ onEdit, onDelete, label }: { onEdit: () => void; onDelete?: () => void; label: string }) {
  return (
    <div className="inline-flex gap-1">
      <button onClick={onEdit} aria-label={`Edit ${label}`} className="grid size-8 place-items-center rounded-full text-smoke hover:bg-white/5 hover:text-volt">
        <Pencil className="size-3.5" />
      </button>
      {onDelete && (
        <button onClick={onDelete} aria-label={`Delete ${label}`} className="grid size-8 place-items-center rounded-full text-smoke hover:bg-danger/10 hover:text-danger">
          <Trash2 className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function Cell({ col, value, labels }: { col: ColumnDef; value: unknown; labels: Record<string, Record<string, string>> }) {
  if (value === null || value === undefined || value === "") return <span className="text-ash">—</span>;
  switch (col.type) {
    case "money":
      return <span className="font-semibold tabular-nums">{inr(Number(value))}</span>;
    case "date":
      return <span className="whitespace-nowrap">{formatDate(String(value))}</span>;
    case "datetime":
      return <span className="whitespace-nowrap">{formatDate(String(value), { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>;
    case "time":
      return <span className="font-mono">{String(value).slice(0, 5)}</span>;
    case "status":
      return <Badge tone={statusTone(String(value))}>{String(value).replace(/_/g, " ")}</Badge>;
    case "boolean":
      return value ? <Badge tone="volt">Yes</Badge> : <span className="text-ash">No</span>;
    case "mono":
      return <span className="font-mono text-xs">{String(value)}</span>;
    case "relation":
      return <span>{labels[col.key]?.[String(value)] ?? "—"}</span>;
    case "image":
      // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-provided URLs
      return <img src={String(value)} alt="" className="size-9 rounded object-cover" loading="lazy" />;
    default:
      if (col.key === "day_of_week") return <span>{DAYS[Number(value)] ?? String(value)}</span>;
      return <span>{Array.isArray(value) ? value.join(", ") : String(value)}</span>;
  }
}

function RecordDialog({
  resource,
  fields,
  row,
  options,
  title,
  onClose,
  onSaved,
}: {
  resource: string;
  fields: FieldDef[];
  row: Row | null;
  options: Record<string, { value: string; label: string }[]>;
  title: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const schema = useMemo(() => buildSchema(fields, row ? "update" : "create"), [fields, row]);
  const { register, handleSubmit, formState, setError } = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema as never),
    defaultValues: toFormValues(fields, row) as never,
  });
  const errors = formState.errors as Record<string, { message?: string } | undefined>;

  const onSubmit = handleSubmit(async () => {
    try {
      // Send raw form values; the server re-validates and converts (e.g. ₹ → paise).
      const raw = Object.fromEntries(new FormData(document.getElementById("record-form") as HTMLFormElement).entries());
      for (const f of fields) if (f.type === "boolean") raw[f.name] = (document.getElementById(`rf-${f.name}`) as HTMLInputElement)?.checked ? "true" : "false";
      if (row) await api(`/api/admin/${resource}/${row.id}`, { method: "PATCH", body: raw });
      else await api(`/api/admin/${resource}`, { body: raw });
      toast.success(row ? "Changes saved" : "Created");
      onSaved();
    } catch (e) {
      applyFieldErrors(e, setError as never);
      toast.error((e as Error).message);
    }
  });

  return (
    <Dialog open onClose={onClose} title={title} size="lg">
      <form id="record-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const id = `rf-${f.name}`;
          const err = errors[f.name]?.message;
          const a11y = { id, "aria-invalid": err ? true : undefined, "aria-describedby": err ? `${id}-error` : undefined };
          let control: React.ReactNode;
          switch (f.type) {
            case "textarea":
              control = <textarea className="field min-h-28" {...a11y} {...register(f.name)} />;
              break;
            case "select":
              control = (
                <select className="field capitalize" {...a11y} {...register(f.name)}>
                  {!f.required && <option value="">—</option>}
                  {f.options!.map((o) => (
                    <option key={o} value={o}>
                      {o.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              );
              break;
            case "relation":
              control = (
                <select className="field" {...a11y} {...register(f.name)}>
                  <option value="">{f.required ? "Select…" : "—"}</option>
                  {(options[f.name] ?? []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              );
              break;
            case "boolean":
              control = (
                <label className="flex h-12 items-center gap-3 text-sm">
                  <input type="checkbox" className="size-5 accent-[#c8ff2e]" {...a11y} {...register(f.name)} /> Enabled
                </label>
              );
              break;
            default: {
              const type = { number: "number", money: "number", date: "date", datetime: "datetime-local", time: "time", url: "url", email: "email" }[f.type as string] ?? "text";
              control = <input className="field" type={type} step={f.type === "money" ? "0.01" : undefined} min={f.min} max={f.max} {...a11y} {...register(f.name)} />;
            }
          }
          return (
            <Field key={f.name} id={id} label={f.label} error={err} hint={f.hint} required={f.required} className={cn(f.wide || f.type === "textarea" ? "sm:col-span-2" : "")}>
              {control}
            </Field>
          );
        })}
        <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4 sm:col-span-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={formState.isSubmitting}>
            {row ? "Save changes" : "Create"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
