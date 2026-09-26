import "server-only";
import { randomBytes } from "node:crypto";
import { ApiError } from "@/lib/api";
import { getRepo, eq, inList, gte, type Repo, type Row } from "@/lib/db";
import { isDemoMode, isRazorpayConfigured, isServiceRoleConfigured, isSupabaseConfigured } from "@/lib/env";
import { notify, notifyAdmin } from "@/lib/notifications";
import { addDays, formatDate, inr, toISODate } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth/session";
import { captureRazorpayPayment, createRazorpayOrder, fetchRazorpayPayment, verifyCheckoutSignature } from "./razorpay";

/** Repo with rights to write payments/memberships (service role in Supabase mode). */
async function ledger(): Promise<Repo> {
  if (isSupabaseConfigured() && !isServiceRoleConfigured()) {
    throw new ApiError(503, "Payments are not configured on this server.", "PAYMENTS_UNCONFIGURED");
  }
  return getRepo("privileged");
}

export const gatewayMode = (): "razorpay" | "demo" | "disabled" => {
  if (isRazorpayConfigured()) return "razorpay";
  if (isDemoMode() || process.env.NODE_ENV !== "production") return "demo";
  return "disabled";
};

export type Quote = { plan: Row; subtotal: number; discount: number; total: number; coupon: Row | null; couponError?: string };

/** Price is ALWAYS computed here from the database — never from client input. */
export async function quote(planSlug: string, couponCode?: string | null): Promise<Quote> {
  const repo = await getRepo("public");
  const plan = await repo.findOne("membership_plans", [eq("slug", planSlug), eq("status", "active")]);
  if (!plan || plan.deleted_at) throw new ApiError(404, "That membership plan is not available.", "PLAN_NOT_FOUND");

  const subtotal = Number(plan.price_paise);
  let discount = 0;
  let coupon: Row | null = null;
  let couponError: string | undefined;

  if (couponCode) {
    const l = await ledger();
    const c = await l.findOne("coupons", [eq("code", couponCode.toUpperCase()), eq("status", "active")]);
    const now = new Date();
    if (!c || c.deleted_at) couponError = "This code isn't valid.";
    else if (c.valid_from && new Date(c.valid_from) > now) couponError = "This code isn't active yet.";
    else if (c.valid_until && new Date(c.valid_until) < now) couponError = "This code has expired.";
    else if (c.max_redemptions && c.redeemed_count >= c.max_redemptions) couponError = "This code has been fully redeemed.";
    else if (Array.isArray(c.plan_ids) && c.plan_ids.length && !c.plan_ids.includes(plan.id)) couponError = `This code doesn't apply to the ${plan.name} plan.`;
    else {
      coupon = c;
      discount = c.discount_type === "percent" ? Math.round((subtotal * Math.min(c.discount_value, 90)) / 100) : Math.min(c.discount_value, subtotal - 100);
    }
  }

  return { plan, subtotal, discount, total: Math.max(100, subtotal - discount), coupon, couponError };
}

/** Step 3 of checkout: create (or reuse) a pending payment + gateway order. */
export async function createCheckout(user: SessionUser, planSlug: string, couponCode?: string | null) {
  const mode = gatewayMode();
  if (mode === "disabled") throw new ApiError(503, "Online payments are temporarily unavailable. Please contact the front desk.", "PAYMENTS_DISABLED");
  if (!user.memberId) throw new ApiError(400, "Complete your member registration first.", "NO_MEMBER");

  const q = await quote(planSlug, couponCode);
  if (q.couponError) throw new ApiError(422, q.couponError, "COUPON_INVALID");

  const l = await ledger();

  // Duplicate protection: reuse an identical open order from the last 30 minutes.
  const recent = await l.list("payments", {
    filters: [eq("member_id", user.memberId), eq("plan_id", q.plan.id), eq("status", "created"), eq("amount_paise", q.total), gte("created_at", new Date(Date.now() - 30 * 60_000).toISOString())],
    order: [{ col: "created_at", asc: false }],
    limit: 1,
  });

  let payment = recent[0];
  if (!payment) {
    const receipt = `rcpt_${Date.now().toString(36)}_${randomBytes(3).toString("hex")}`;
    const orderId =
      mode === "razorpay"
        ? (await createRazorpayOrder(q.total, receipt, { plan: q.plan.slug, member: user.memberId, user: user.id })).id
        : `order_demo_${randomBytes(8).toString("hex")}`;

    payment = await l.insert("payments", {
      user_id: user.id,
      member_id: user.memberId,
      plan_id: q.plan.id,
      coupon_id: q.coupon?.id ?? null,
      razorpay_order_id: orderId,
      amount_paise: q.total,
      discount_paise: q.discount,
      currency: "INR",
      status: "created",
      metadata: { receipt, gateway: mode },
    });
  }

  return {
    mode,
    orderId: payment.razorpay_order_id as string,
    paymentId: payment.id as string,
    amount: payment.amount_paise as number,
    currency: "INR",
    keyId: mode === "razorpay" ? process.env.RAZORPAY_KEY_ID : undefined,
    plan: { name: q.plan.name, slug: q.plan.slug },
    prefill: { name: user.name, email: user.email, contact: user.phone ?? undefined },
  };
}

const receiptNumber = () => `ATX-${new Date().getFullYear()}-${randomBytes(4).toString("hex").toUpperCase()}`;

/**
 * Idempotently mark an order paid and activate the membership.
 * Safe to call from the verify endpoint AND the webhook concurrently: the
 * status transition is a compare-and-set, so only one caller activates.
 */
export async function settleOrder(params: { orderId: string; paymentId: string; signature?: string | null; method?: string | null; source: "checkout" | "webhook" | "demo" }) {
  const l = await ledger();
  const payment = await l.findOne("payments", [eq("razorpay_order_id", params.orderId)]);
  if (!payment) throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");

  if (payment.status === "paid") {
    if (payment.razorpay_payment_id && payment.razorpay_payment_id !== params.paymentId) {
      // Customer was charged twice for one order — flag for refund.
      const dups: string[] = payment.metadata?.duplicate_payment_ids ?? [];
      if (!dups.includes(params.paymentId)) {
        await l.update("payments", payment.id, { metadata: { ...payment.metadata, duplicate_payment_ids: [...dups, params.paymentId] } });
        await notifyAdmin("Duplicate payment detected", `Order ${params.orderId} received a second payment ${params.paymentId}. Please refund it from the Razorpay dashboard.`);
      }
    }
    return { payment, alreadyProcessed: true };
  }

  // Compare-and-set: only one concurrent caller wins this transition.
  const won = await l.updateWhere("payments", [eq("id", payment.id), inList("status", ["created", "failed", "cancelled"])], {
    status: "paid",
    razorpay_payment_id: params.paymentId,
    razorpay_signature: params.signature ?? null,
    method: params.method ?? null,
    failure_reason: null,
    paid_at: new Date().toISOString(),
    receipt_number: receiptNumber(),
    metadata: { ...payment.metadata, settled_by: params.source },
  });
  if (!won.length) {
    return { payment: await l.get("payments", payment.id), alreadyProcessed: true };
  }

  const plan = await l.get("membership_plans", payment.plan_id);
  if (!plan) throw new Error("Plan missing for payment " + payment.id);

  // Renewal: stack on top of the current active membership.
  const current = await l.list("memberships", {
    filters: [eq("member_id", payment.member_id), eq("status", "active"), gte("end_date", toISODate(new Date()))],
    order: [{ col: "end_date", asc: false }],
    limit: 1,
  });
  const isRenewal = Boolean(current[0]);
  const start = isRenewal ? addDays(new Date(current[0].end_date), 1) : new Date();
  const end = addDays(start, Number(plan.duration_days) - 1);

  const membership = await l.insert("memberships", {
    member_id: payment.member_id,
    plan_id: plan.id,
    start_date: toISODate(start),
    end_date: toISODate(end),
    amount_paise: payment.amount_paise,
    status: "active",
  });
  const paid = await l.update("payments", payment.id, { membership_id: membership.id });

  if (payment.coupon_id) {
    const c = await l.get("coupons", payment.coupon_id);
    if (c) await l.update("coupons", c.id, { redeemed_count: Number(c.redeemed_count) + 1 });
  }

  const user = await l.get("users", payment.user_id);
  await notify(isRenewal ? "membership_renewal" : "payment_confirmation", { userId: payment.user_id, email: user?.email, phone: user?.phone }, {
    name: user?.full_name,
    plan: plan.name,
    amount: inr(payment.amount_paise),
    start: formatDate(start),
    end: formatDate(end),
    receipt: paid.receipt_number,
  });
  await notifyAdmin("Payment received", `${user?.full_name ?? "A member"} paid ${inr(payment.amount_paise)} for ${plan.name}.`, "payment_confirmation");

  return { payment: paid, membership, alreadyProcessed: false };
}

/** Server-side verification of a Razorpay Checkout success callback. */
export async function verifyCheckout(user: SessionUser, orderId: string, paymentId: string, signature: string) {
  if (gatewayMode() !== "razorpay") throw new ApiError(400, "Gateway not configured", "NO_GATEWAY");
  if (!verifyCheckoutSignature(orderId, paymentId, signature)) throw new ApiError(400, "Payment signature mismatch.", "BAD_SIGNATURE");

  const l = await ledger();
  const payment = await l.findOne("payments", [eq("razorpay_order_id", orderId)]);
  if (!payment || payment.user_id !== user.id) throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");

  // Double-check with Razorpay: right order, right amount, money actually moved.
  let rzp = await fetchRazorpayPayment(paymentId);
  if (rzp.order_id !== orderId || rzp.amount !== payment.amount_paise || rzp.currency !== "INR") {
    await notifyAdmin("Payment mismatch", `Payment ${paymentId} does not match order ${orderId}.`);
    throw new ApiError(400, "Payment details did not match the order.", "MISMATCH");
  }
  if (rzp.status === "authorized") rzp = await captureRazorpayPayment(paymentId, rzp.amount);
  if (rzp.status !== "captured") throw new ApiError(402, "Payment is not complete yet.", "NOT_CAPTURED");

  return settleOrder({ orderId, paymentId, signature, method: rzp.method, source: "checkout" });
}

/** Record a failed/cancelled attempt. Never grants anything, so client input is acceptable here. */
export async function markUnsuccessful(user: SessionUser, orderId: string, status: "failed" | "cancelled", reason?: string) {
  const l = await ledger();
  const payment = await l.findOne("payments", [eq("razorpay_order_id", orderId)]);
  if (!payment || payment.user_id !== user.id) throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
  const updated = await l.updateWhere("payments", [eq("id", payment.id), eq("status", "created")], { status, failure_reason: reason?.slice(0, 300) ?? null });
  if (updated.length && status === "failed") {
    const plan = await l.get("membership_plans", payment.plan_id);
    await notify("payment_failed", { userId: user.id, email: user.email }, { name: user.name, plan: plan?.name, reason }, ["email", "in_app"]);
  }
  return { status: updated[0]?.status ?? payment.status };
}
