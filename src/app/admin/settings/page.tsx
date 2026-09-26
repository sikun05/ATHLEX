import { requireUser } from "@/lib/auth/session";
import { getRepo } from "@/lib/db";
import { isDemoMode, isRazorpayConfigured, isServiceRoleConfigured, isSupabaseConfigured } from "@/lib/env";
import { Card, PageHeader } from "@/components/dashboard/ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { Badge } from "@/components/ui/misc";
import { site } from "@/lib/site";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireUser(["admin"], "/admin/settings");
  const repo = await getRepo("user");
  const [gym, notifications] = await Promise.all([repo.get("settings", "gym", "key"), repo.get("settings", "notifications", "key")]);
  const integrations = [
    ["Supabase database & auth", isSupabaseConfigured()],
    ["Service role (payments, cron)", isServiceRoleConfigured()],
    ["Razorpay payments", isRazorpayConfigured()],
    ["Razorpay webhook secret", Boolean(process.env.RAZORPAY_WEBHOOK_SECRET)],
    ["Cron secret", Boolean(process.env.CRON_SECRET)],
  ] as const;
  return (
    <>
      <PageHeader eyebrow="Admin" title="Settings" />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Club & notifications" className="xl:col-span-2">
          <SettingsForm
            initial={{
              gym: gym?.value ?? { name: site.name, phone: site.phone, email: site.email, gst_number: "", attendance_window_minutes: 1 },
              notifications: notifications?.value ?? { email: true, whatsapp: true, sms: false, reminder_hours_before_class: 2, expiry_reminder_days: [7, 3, 1] },
            }}
          />
        </Card>
        <Card title="Integrations">
          {isDemoMode() && <p className="mb-4 rounded-md border border-volt/25 bg-volt/5 p-3 text-xs text-bone/80">Demo mode: data is in memory and resets on restart. Add Supabase keys to go live.</p>}
          <ul className="space-y-3 text-sm">
            {integrations.map(([name, on]) => (
              <li key={name} className="flex items-center justify-between gap-3">
                {name}
                <Badge tone={on ? "ok" : "warn"}>{on ? "Configured" : "Missing"}</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-ash">Secrets are read from server environment variables and never sent to the browser.</p>
        </Card>
      </div>
    </>
  );
}
