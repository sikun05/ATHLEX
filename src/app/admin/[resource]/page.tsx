import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getResource } from "@/lib/admin/resources";
import { relationOptions, resolveRelations } from "@/lib/admin/stats";
import { getRepo, eq } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/ui";
import { ResourceTable } from "@/components/admin/resource-table";

const PAGE_SIZE = 25;

export async function generateMetadata({ params }: PageProps<"/admin/[resource]">) {
  return { title: getResource((await params).resource)?.title ?? "Admin" };
}

export default async function ResourcePage({ params, searchParams }: PageProps<"/admin/[resource]">) {
  const { resource } = await params;
  const res = getResource(resource);
  if (!res) notFound();
  const user = await requireUser(res.read, `/admin/${resource}`);
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const repo = await getRepo("user");
  const opts = {
    filters: status && res.statusFilter?.options.includes(status) ? [eq(res.statusFilter.col, status)] : [],
    search: q && res.search.length ? { cols: res.search, q } : undefined,
  };
  const [rows, total] = await Promise.all([
    repo.list(res.listFrom ?? res.table, { ...opts, order: [res.order, { col: "id" }], limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    repo.count(res.listFrom ?? res.table, opts),
  ]);
  const canWrite = res.write.includes(user.role);
  const [labels, options] = await Promise.all([resolveRelations(rows, res.columns), canWrite ? relationOptions(res.fields) : Promise.resolve({})]);

  // Rows for editing must come from the base table when listing from a view.
  const editRows = res.listFrom ? await repo.list(res.table, { filters: [{ col: "id", op: "in", value: rows.map((r) => r.id) }], includeDeleted: true }) : rows;

  return (
    <>
      <PageHeader eyebrow={res.group} title={res.title}>
        {res.description}
      </PageHeader>
      <ResourceTable
        resource={res.slug}
        rows={rows}
        editRows={Object.fromEntries(editRows.map((r) => [r.id, r]))}
        labels={labels}
        options={options}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        q={q}
        status={status}
        canWrite={canWrite}
      />
    </>
  );
}
