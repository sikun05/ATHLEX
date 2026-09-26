import { z } from "zod";
import { authorize, handler, limit, ok, parseBody } from "@/lib/api";
import { quote } from "@/lib/payments/service";
import { createOrderSchema } from "@/lib/validation";

export const POST = handler(async (req) => {
  await authorize();
  await limit("quote", 20, 10 * 60_000); // throttles coupon guessing
  const { planSlug, couponCode } = await parseBody(req, createOrderSchema.extend({ couponCode: z.string().trim().toUpperCase().max(30).optional() }));
  const q = await quote(planSlug, couponCode || null);
  return ok({ subtotal: q.subtotal, discount: q.discount, total: q.total, coupon: q.coupon ? { code: q.coupon.code, description: q.coupon.description } : null, couponError: q.couponError });
});
