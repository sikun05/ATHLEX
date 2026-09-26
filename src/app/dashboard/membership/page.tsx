import Link from "next/link";
import { Receipt } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getActiveMembership } from "@/lib/members";
import { getPayments } from "@/lib/dashboard";
import { getRepo, eq } from "@/lib/db";
import { Card, PageHeader, Ring } from "@/components/dashboard/ui";
import { NoMemberProfile } from "@/components/dashboard/no-member";
import { Badge, EmptyState, statusTone } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { formatDate, inr } from "@/lib/utils";

export const metadata = { title: "My Membership" };

export default async function MembershipPage() {
  const user = await requireUser();
  if (!user.memberId) return <NoMemberProfile />;
  const repo = await getRepo("user");
  const [active, payments, history, member] = await Promise.all([
    getActiveMembership(user.memberId),
    getPayments(user.id),
    repo.list("memberships", { filters: [eq("member_id", user.memberId)], order: [{ col: "start_date", asc: false }] }),
    repo.get("members", user.memberId),
  ]);
  const plans = await repo.list("membership_plans", { includeDeleted: true });
  const planName = (id: string) => plans.find((p) => p.id === id)?.name ?? "—";

  return (
    <>
      <PageHeader eyebrow={`Member ${member?.member_code ?? ""}`} title="My membership" actions={<ButtonLink href="/membership" size="sm" variant="outline">Compare plans</ButtonLink>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Current plan">
          {active ? (
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
              <Ring value={active.daysRemaining} max={active.plan?.duration_days ?? 30} size={150} label={<span><span className="display block text-5xl">{active.daysRemaining}</span><span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-smoke">days left</span></span>} />
              <dl className="grid flex-1 grid-cols-2 gap-5 text-sm">
                <Item k="Plan" v={<span className="display text-3xl text-volt">{active.plan?.name}</span>} />
                <Item k="Status" v={<Badge tone={active.daysRemaining <= 7 ? "warn" : "ok"}>{active.daysRemaining <= 7 ? "Expiring soon" : "Active"}</Badge>} />
                <Item k="Start date" v={formatDate(active.start_date)} />
                <Item k="Expiry date" v={formatDate(active.effectiveEnd)} />
                {active.queued.length > 0 && <Item k="Queued renewal" v={`${planName(active.queued[0].plan_id)} from ${formatDate(active.queued[0].start_date)}`} />}
              </dl>
            </div>
          ) : (
            <EmptyState title="No active membership" action={<ButtonLink href="/membership" arrow>Choose a plan</ButtonLink>}>
              Your previous membership has ended or you haven&apos;t purchased one yet.
            </EmptyState>
          )}
        </Card>
        <Card title="Renew">
          <p className="text-sm text-smoke">Renew early and your new plan starts the day after your current one ends — you never lose a day.</p>
          <div className="mt-6 grid gap-2">
            {plans
              .filter((p) => p.status === "active" && !p.deleted_at)
              .map((p) => (
                <Link key={p.id} href={`/checkout/${p.slug}`} className="flex items-center justify-between rounded-md border border-white/10 px-4 py-3 text-sm transition hover:border-volt">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-smoke">{inr(p.price_paise)}</span>
                </Link>
              ))}
          </div>
        </Card>
      </div>

      <Card title="Payment history" className="mt-4">
        {payments.length ? (
          <div className="-mx-5 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-smoke">
                <tr>
                  <th className="px-5 py-3 font-normal sm:px-3">Date</th>
                  <th className="px-3 py-3 font-normal">Plan</th>
                  <th className="px-3 py-3 font-normal">Amount</th>
                  <th className="px-3 py-3 font-normal">Method</th>
                  <th className="px-3 py-3 font-normal">Status</th>
                  <th className="px-3 py-3 font-normal">
                    <span className="sr-only">Receipt</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 sm:px-3">{formatDate(p.paid_at ?? p.created_at)}</td>
                    <td className="px-3 py-3">{p.plan_name}</td>
                    <td className="px-3 py-3 font-semibold">{inr(p.amount_paise)}</td>
                    <td className="px-3 py-3 uppercase text-smoke">{p.method ?? "—"}</td>
                    <td className="px-3 py-3">
                      <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {p.status === "paid" && (
                        <Link href={`/checkout/success?payment=${p.id}`} className="inline-flex items-center gap-1 text-xs text-volt hover:underline">
                          <Receipt className="size-3.5" /> Receipt
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-smoke">No payments yet.</p>
        )}
      </Card>

      <Card title="Membership history" className="mt-4">
        <ul className="divide-y divide-white/[0.06]">
          {history.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <span className="font-semibold">{planName(m.plan_id)}</span>
              <span className="text-smoke">
                {formatDate(m.start_date)} → {formatDate(m.end_date)}
              </span>
              <Badge tone={statusTone(m.status)}>{m.status}</Badge>
            </li>
          ))}
          {!history.length && <li className="py-3 text-sm text-smoke">No memberships yet.</li>}
        </ul>
      </Card>
    </>
  );
}

function Item({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-smoke">{k}</dt>
      <dd className="mt-1.5">{v}</dd>
    </div>
  );
}
