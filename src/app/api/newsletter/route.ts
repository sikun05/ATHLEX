import { handler, limit, ok, parseBody } from "@/lib/api";
import { getRepo } from "@/lib/db";
import { isBackendAvailable } from "@/lib/env";
import { newsletterSchema } from "@/lib/validation";

export const POST = handler(async (req) => {
  await limit("newsletter", 5, 10 * 60_000);
  const { email } = await parseBody(req, newsletterSchema);
  if (isBackendAvailable()) {
    const repo = await getRepo("public");
    try {
      await repo.insert("newsletter_subscribers", { email }, { returning: false });
    } catch (e) {
      // Unique violation = already subscribed; respond identically to avoid email enumeration.
      if (!/duplicate|unique/i.test((e as Error).message)) throw e;
    }
  }
  return ok({ subscribed: true });
});
