import { requireUser, DESK_ROLES } from "@/lib/auth/session";
import { getRepo, gte, inList } from "@/lib/db";
import { Card, PageHeader } from "@/components/dashboard/ui";
import { Scanner } from "@/components/admin/scanner";
import { Badge } from "@/components/ui/misc";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Attendance" };

export default async function AdminAttendancePage() {
  await requireUser(DESK_ROLES, "/admin/attendance");
  const repo = await getRepo("user");
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const rows = await repo.list("attendance", { filters: [gte("check_in_at", start.toISOString())], order: [{ col: "check_in_at", asc: false }] });
  const members = rows.length ? await repo.list("member_directory", { filters: [inList("id", [...new Set(rows.map((r) => r.member_id))])] }) : [];
  const byId = Object.fromEntries(members.map((m) => [m.id, m]));

  return (
    <>
      <PageHeader eyebrow="Front desk" title="Attendance scanner">
        Scan the member&apos;s rotating QR code from their dashboard. We verify the signature, expiry and active membership before marking attendance.
      </PageHeader>
      <Scanner />
      <Card title={`Today · ${rows.length} check-ins · ${rows.filter((r) => !r.check_out_at).length} on the floor`} className="mt-4">
        <div className="-mx-5 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-smoke">
              <tr>
                <th className="px-5 py-3 font-normal sm:px-3">Member</th>
                <th className="px-3 py-3 font-normal">In</th>
                <th className="px-3 py-3 font-normal">Out</th>
                <th className="px-3 py-3 font-normal">Method</th>
                <th className="px-3 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 sm:px-3">
                    <span className="font-semibold">{byId[r.member_id]?.full_name ?? "Member"}</span> <span className="font-mono text-xs text-ash">{byId[r.member_id]?.member_code}</span>
                  </td>
                  <td className="px-3 py-3">{formatDate(r.check_in_at, { hour: "numeric", minute: "2-digit" })}</td>
                  <td className="px-3 py-3">{r.check_out_at ? formatDate(r.check_out_at, { hour: "numeric", minute: "2-digit" }) : "—"}</td>
                  <td className="px-3 py-3 uppercase text-smoke">{r.method}</td>
                  <td className="px-3 py-3">{r.check_out_at ? <Badge>Left</Badge> : <Badge tone="ok">On floor</Badge>}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-smoke">
                    No check-ins yet today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
