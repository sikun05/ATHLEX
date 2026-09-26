import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getRepo } from "@/lib/db";
import { PrintButton } from "@/components/dashboard/print-button";
import { site } from "@/lib/site";
import { formatDate, inr } from "@/lib/utils";

export const metadata: Metadata = { title: "Payment successful", robots: { index: false } };

export default async function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const user = await requireUser(undefined, "/dashboard/membership");
  const { payment: paymentId } = await searchParams;
  if (typeof paymentId !== "string") redirect("/dashboard/membership");

  const repo = await getRepo("user");
  const payment = await repo.get("payments", paymentId);
  // RLS already restricts this in Supabase; enforce ownership explicitly for demo mode too.
  if (!payment || (payment.user_id !== user.id && user.role === "member")) redirect("/dashboard/membership");
  const [plan, membership] = await Promise.all([repo.get("membership_plans", payment.plan_id), payment.membership_id ? repo.get("memberships", payment.membership_id) : null]);
  const paid = payment.status === "paid";

  return (
    <div className="container-x max-w-3xl pb-24 pt-36">
      <div className="text-center print:hidden">
        <CheckCircle2 className={`mx-auto size-16 ${paid ? "text-volt" : "text-warn"}`} />
        <h1 className="display mt-6 text-6xl">{paid ? "You're in." : "Payment processing"}</h1>
        <p className="mt-3 text-smoke">
          {paid ? `Welcome to ${site.name}, ${user.name.split(" ")[0]}. A confirmation has been sent to ${user.email}.` : "We're confirming your payment with the bank. This page will update once it's verified."}
        </p>
      </div>

      <section aria-label="Receipt" className="mt-12 rounded-[var(--radius-card)] border border-white/10 bg-graphite p-6 sm:p-10 print:border-black print:bg-white print:text-black">
        <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <p className="display text-3xl">{site.name}</p>
            <p className="text-xs text-smoke">{site.legalName}</p>
            <p className="text-xs text-smoke">
              {site.address.street}, {site.address.city}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-smoke">Receipt</p>
            <p className="font-mono text-sm">{payment.receipt_number ?? "—"}</p>
            <p className="text-xs text-smoke">{payment.paid_at ? formatDate(payment.paid_at) : ""}</p>
          </div>
        </div>
        <dl className="grid gap-4 py-6 text-sm sm:grid-cols-2">
          <Row k="Billed to" v={`${user.name} · ${user.email}`} />
          <Row k="Plan" v={`${plan?.name ?? ""} (${plan?.duration_months ?? ""} months)`} />
          <Row k="Valid" v={membership ? `${formatDate(membership.start_date)} → ${formatDate(membership.end_date)}` : "Pending"} />
          <Row k="Payment ID" v={payment.razorpay_payment_id ?? "—"} mono />
          <Row k="Method" v={(payment.method ?? "—").toUpperCase()} />
          <Row k="Status" v={payment.status.toUpperCase()} />
        </dl>
        <dl className="space-y-2 border-t border-white/10 pt-6 text-sm">
          <div className="flex justify-between">
            <dt className="text-smoke">Subtotal</dt>
            <dd>{inr(payment.amount_paise + (payment.discount_paise ?? 0))}</dd>
          </div>
          {payment.discount_paise > 0 && (
            <div className="flex justify-between">
              <dt className="text-smoke">Discount</dt>
              <dd>−{inr(payment.discount_paise)}</dd>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <dt>Total paid (incl. GST)</dt>
            <dd>{inr(payment.amount_paise)}</dd>
          </div>
        </dl>
      </section>

      <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
        <Link href="/dashboard" className="inline-flex h-12 items-center rounded-full bg-volt px-6 text-xs font-semibold uppercase tracking-[0.08em] text-ink">
          Go to dashboard
        </Link>
        <PrintButton />
      </div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div>
      <dt className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-smoke">{k}</dt>
      <dd className={`mt-1 ${mono ? "font-mono text-xs" : ""}`}>{v}</dd>
    </div>
  );
}
