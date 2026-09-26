import { handler, limit, ok, parseBody, ApiError } from "@/lib/api";
import { getRepo } from "@/lib/db";
import { isBackendAvailable } from "@/lib/env";
import { notifyAdmin } from "@/lib/notifications";
import { contactSchema } from "@/lib/validation";

export const POST = handler(async (req) => {
  await limit("contact", 5, 10 * 60_000);
  const input = await parseBody(req, contactSchema);
  if (input.company) return ok({ received: true });
  if (!isBackendAvailable()) throw new ApiError(503, "Messaging is temporarily unavailable. Please email us.");

  const repo = await getRepo("public");
  await repo.insert("contact_messages", { name: input.name, email: input.email, phone: input.phone || null, subject: input.subject, message: input.message, status: "new" }, { returning: false });
  await notifyAdmin(`Enquiry: ${input.subject}`, `${input.name} <${input.email}>: ${input.message.slice(0, 400)}`, "contact_message");
  return ok({ received: true }, { status: 201 });
});
