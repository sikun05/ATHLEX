import { assertSameOrigin, authorize, handler, limit, ok, parseBody } from "@/lib/api";
import { createCheckout } from "@/lib/payments/service";
import { createOrderSchema } from "@/lib/validation";

export const POST = handler(async (req) => {
  await assertSameOrigin(req);
  const user = await authorize(["member", "admin", "staff", "trainer"]);
  await limit("order", 10, 10 * 60_000);
  const { planSlug, couponCode } = await parseBody(req, createOrderSchema);
  return ok(await createCheckout(user, planSlug, couponCode || null), { status: 201 });
});
