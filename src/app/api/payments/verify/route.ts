import { assertSameOrigin, authorize, handler, ok, parseBody } from "@/lib/api";
import { verifyCheckout } from "@/lib/payments/service";
import { verifyPaymentSchema } from "@/lib/validation";

/** Called by the browser after Razorpay Checkout succeeds. Signature + API re-check happen server-side. */
export const POST = handler(async (req) => {
  await assertSameOrigin(req);
  const user = await authorize();
  const b = await parseBody(req, verifyPaymentSchema);
  const res = await verifyCheckout(user, b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature);
  return ok({ paymentId: res.payment?.id, alreadyProcessed: res.alreadyProcessed });
});
