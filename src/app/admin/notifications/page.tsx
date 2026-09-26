import { requireUser, STAFF_ROLES } from "@/lib/auth/session";
import { getRepo } from "@/lib/db";
import { Card, PageHeader } from "@/components/dashboard/ui";
import { BroadcastForm } from "@/components/admin/broadcast-form";
import { Badge } from "@/components/ui/misc";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Notifications" };

export default async function AdminNotificationsPage() {
  await requireUser(STAFF_ROLES, "/admin/notifications");
  const repo = await getRepo("user");
  const feed = await repo.list("notifications", { filters: [{ col: "user_id", op: "is", value: null }], order: [{ col: "created_at", asc: false }], limit: 40 });
  const channels = [
    ["Email", Boolean(process.env.RESEND_API_KEY)],
    ["WhatsApp", Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)],
    ["SMS", Boolean(process.env.TWILIO_ACCOUNT_SID)],
  ] as const;
  return (
    <>
      <PageHeader eyebrow="Comms" title="Notifications">
        Admin alerts for new registrations, trial bookings, payments and enquiries — plus broadcasts to members.
      </PageHeader>
      <div className="grid gap-4 xl:grid-cols-5">
        <Card title="Admin alerts" className="xl:col-span-3">
          <ul className="divide-y divide-white/[0.06]">
            {feed.map((n) => (
              <li key={n.id} className="flex items-start gap-3 py-3">
                <Badge>{String(n.type).replace(/_/g, " ")}</Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-sm text-smoke">{n.body}</p>
                </div>
                <time className="shrink-0 font-mono text-[0.6rem] text-ash">{formatDate(n.created_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</time>
              </li>
            ))}
            {!feed.length && <li className="py-3 text-sm text-smoke">No alerts yet.</li>}
          </ul>
        </Card>
        <div className="space-y-4 xl:col-span-2">
          <Card title="Broadcast to members">
            <BroadcastForm />
          </Card>
          <Card title="Channel status">
            <ul className="space-y-2 text-sm">
              {channels.map(([name, on]) => (
                <li key={name} className="flex items-center justify-between">
                  {name} <Badge tone={on ? "ok" : "warn"}>{on ? "Connected" : "Logging only"}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
