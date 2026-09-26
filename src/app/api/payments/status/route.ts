import { assertSameOrigin, authorize, handler, ok, parseBody } from "@/lib/api";
import { markUnsuccessful } from "@/lib/payments/service";
import { paymentStatusSchema } from "@/lib/validation";

/** Records a cancelled/failed attempt so the admin sees abandoned checkouts. Grants nothing. */
export const POST = handler(async (req) => {
  await assertSameOrigin(req);
  const user = await authorize();
  const b = await parseBody(req, paymentStatusSchema);
  return ok(await markUnsuccessful(user, b.orderId, b.status, b.reason));
});
