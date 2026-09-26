import { handler, limit, ok, parseBody, ApiError } from "@/lib/api";
import { getRepo } from "@/lib/db";
import { isBackendAvailable } from "@/lib/env";
import { notify, notifyAdmin } from "@/lib/notifications";
import { formatDate } from "@/lib/utils";
import { trialBookingSchema } from "@/lib/validation";

export const POST = handler(async (req) => {
  await limit("trial", 5, 10 * 60_000);
  const input = await parseBody(req, trialBookingSchema);
  if (input.company) return ok({ received: true }); // honeypot: silently drop bots
  if (!isBackendAvailable()) throw new ApiError(503, "Bookings are temporarily unavailable. Please call us.");

  const repo = await getRepo("public");
  await repo.insert(
    "trial_bookings",
    {
      name: input.name,
      phone: input.phone,
      email: input.email,
      preferred_date: input.preferredDate,
      preferred_time: input.preferredTime,
      interest: input.interest,
      message: input.message || null,
      source: "website",
      status: "new",
    },
    { returning: false },
  );

  const date = formatDate(input.preferredDate, { weekday: "short", day: "numeric", month: "short" });
  await Promise.allSettled([
    notify("trial_booking", { email: input.email, phone: input.phone, name: input.name }, { name: input.name.split(" ")[0], interest: input.interest, date, time: input.preferredTime }, ["email", "whatsapp"]),
    notifyAdmin("New trial booking", `${input.name} (${input.phone}) booked a ${input.interest} trial for ${date} at ${input.preferredTime}.`, "trial_booking"),
  ]);

  return ok({ received: true }, { status: 201 });
});
