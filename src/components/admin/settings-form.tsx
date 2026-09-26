"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

type Settings = {
  gym: { name: string; phone: string; email: string; gst_number?: string; attendance_window_minutes: number };
  notifications: { email: boolean; whatsapp: boolean; sms: boolean; reminder_hours_before_class: number; expiry_reminder_days: number[] };
};

export function SettingsForm({ initial }: { initial: Settings }) {
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const body: Settings = {
          gym: {
            name: String(f.get("name")),
            phone: String(f.get("phone")),
            email: String(f.get("email")),
            gst_number: String(f.get("gst_number") ?? ""),
            attendance_window_minutes: Number(f.get("attendance_window_minutes")),
          },
          notifications: {
            email: f.get("n_email") === "on",
            whatsapp: f.get("n_whatsapp") === "on",
            sms: f.get("n_sms") === "on",
            reminder_hours_before_class: Number(f.get("reminder_hours_before_class")),
            expiry_reminder_days: String(f.get("expiry_reminder_days"))
              .split(",")
              .map((x) => Number(x.trim()))
              .filter((x) => !Number.isNaN(x)),
          },
        };
        setBusy(true);
        try {
          await api("/api/admin/settings", { method: "PUT", body });
          toast.success("Settings saved");
        } catch (err) {
          toast.error((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field id="s-name" label="Gym name">
        <input id="s-name" name="name" className="field" defaultValue={initial.gym.name} />
      </Field>
      <Field id="s-phone" label="Phone">
        <input id="s-phone" name="phone" className="field" defaultValue={initial.gym.phone} />
      </Field>
      <Field id="s-email" label="Email">
        <input id="s-email" name="email" type="email" className="field" defaultValue={initial.gym.email} />
      </Field>
      <Field id="s-gst" label="GST number">
        <input id="s-gst" name="gst_number" className="field" defaultValue={initial.gym.gst_number} />
      </Field>
      <Field id="s-win" label="QR validity (minutes)">
        <input id="s-win" name="attendance_window_minutes" type="number" min={1} max={10} className="field" defaultValue={initial.gym.attendance_window_minutes} />
      </Field>
      <Field id="s-rem" label="Class reminder (hours before)">
        <input id="s-rem" name="reminder_hours_before_class" type="number" min={1} max={48} className="field" defaultValue={initial.notifications.reminder_hours_before_class} />
      </Field>
      <Field id="s-exp" label="Expiry reminders (days before, comma separated)" className="sm:col-span-2">
        <input id="s-exp" name="expiry_reminder_days" className="field" defaultValue={initial.notifications.expiry_reminder_days.join(", ")} />
      </Field>
      <fieldset className="sm:col-span-2">
        <legend className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-smoke">Enabled channels</legend>
        <div className="flex gap-6 text-sm">
          {(["email", "whatsapp", "sms"] as const).map((c) => (
            <label key={c} className="flex items-center gap-2 capitalize">
              <input type="checkbox" name={`n_${c}`} className="size-4 accent-[#c8ff2e]" defaultChecked={initial.notifications[c]} /> {c}
            </label>
          ))}
        </div>
      </fieldset>
      <Button type="submit" loading={busy} className="justify-self-start">
        Save settings
      </Button>
    </form>
  );
}
