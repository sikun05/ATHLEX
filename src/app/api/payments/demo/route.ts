import { randomBytes } from "node:crypto";
import { z } from "zod";
import { ApiError, assertSameOrigin, authorize, handler, ok, parseBody } from "@/lib/api";
import { getRepo, eq } from "@/lib/db";
import { gatewayMode, markUnsuccessful, settleOrder } from "@/lib/payments/service";

/**
 * Simulated gateway for development / demo mode ONLY.
 * Disabled automatically whenever real Razorpay keys are configured.
 */
export const POST = handler(async (req) => {
  if (gatewayMode() !== "demo") throw new ApiError(404, "Not found");
  await assertSameOrigin(req);
  const user = await authorize();
  const { orderId, outcome } = await parseBody(req, z.object({ orderId: z.string().startsWith("order_demo_"), outcome: z.enum(["success", "failed", "cancelled"]) }));

  const repo = await getRepo("privileged");
  const payment = await repo.findOne("payments", [eq("razorpay_order_id", orderId)]);
  if (!payment || payment.user_id !== user.id) throw new ApiError(404, "Order not found");

  if (outcome !== "success") {
    await markUnsuccessful(user, orderId, outcome, outcome === "failed" ? "Card declined by issuing bank (simulated)" : "Checkout closed by user");
    return ok({ status: outcome });
  }
  const res = await settleOrder({ orderId, paymentId: `pay_demo_${randomBytes(7).toString("hex")}`, method: "upi", source: "demo" });
  return ok({ status: "paid", paymentId: res.payment?.id });
});
