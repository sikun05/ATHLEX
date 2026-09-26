import { NextResponse } from "next/server";
import { getRepo, eq } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { settleOrder } from "@/lib/payments/service";
import { notifyAdmin } from "@/lib/notifications";

/**
 * Razorpay webhook (configure in Dashboard → Webhooks → events: payment.captured, payment.failed, order.paid).
 * Source of truth for payment state: activates memberships even if the customer closed the tab.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let event: { event: string; payload: { payment?: { entity: { id: string; order_id: string; amount: number; method?: string; error_description?: string } } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const p = event.payload.payment?.entity;
  try {
    if (p && (event.event === "payment.captured" || event.event === "order.paid")) {
      const repo = await getRepo("privileged");
      const row = await repo.findOne("payments", [eq("razorpay_order_id", p.order_id)]);
      if (!row) return NextResponse.json({ ok: true, ignored: "unknown order" });
      if (row.amount_paise !== p.amount) {
        await notifyAdmin("Webhook amount mismatch", `Order ${p.order_id}: expected ${row.amount_paise}, got ${p.amount}.`);
        return NextResponse.json({ ok: true, ignored: "amount mismatch" });
      }
      await settleOrder({ orderId: p.order_id, paymentId: p.id, method: p.method, source: "webhook" });
    } else if (p && event.event === "payment.failed") {
      const repo = await getRepo("privileged");
      await repo.updateWhere("payments", [eq("razorpay_order_id", p.order_id), eq("status", "created")], { status: "failed", failure_reason: p.error_description ?? "Payment failed" });
    }
  } catch (err) {
    console.error("[webhook]", err);
    // 5xx → Razorpay retries with backoff; settleOrder is idempotent.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
