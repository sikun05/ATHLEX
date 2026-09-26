"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { api } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function BroadcastForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [channels, setChannels] = useState<string[]>(["in_app", "email"]);
  return (
    <form
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        try {
          const r = await api<{ recipients: number }>("/api/admin/broadcast", { body: { audience: f.get("audience"), title: f.get("title"), body: f.get("body"), channels } });
          toast.success(`Sent to ${r.recipients} members`);
          (e.target as HTMLFormElement).reset();
          router.refresh();
        } catch (err) {
          toast.error((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field id="b-audience" label="Audience">
        <select id="b-audience" name="audience" className="field">
          <option value="active">Active members</option>
          <option value="expiring">Expiring within 7 days</option>
          <option value="all">All members</option>
        </select>
      </Field>
      <Field id="b-title" label="Title" required>
        <input id="b-title" name="title" className="field" required minLength={3} maxLength={120} placeholder="Diwali timings" />
      </Field>
      <Field id="b-body" label="Message" required>
        <textarea id="b-body" name="body" className="field min-h-28" required minLength={5} maxLength={1000} />
      </Field>
      <fieldset>
        <legend className="mb-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-smoke">Channels</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          {[
            ["in_app", "In-app"],
            ["email", "Email"],
            ["whatsapp", "WhatsApp"],
            ["sms", "SMS"],
          ].map(([v, l]) => (
            <label key={v} className="flex items-center gap-2">
              <input type="checkbox" className="size-4 accent-[#c8ff2e]" checked={channels.includes(v)} onChange={(e) => setChannels((c) => (e.target.checked ? [...c, v] : c.filter((x) => x !== v)))} />
              {l}
            </label>
          ))}
        </div>
      </fieldset>
      <Button type="submit" loading={busy} disabled={!channels.length} className="justify-self-start">
        <Send className="size-4" /> Send broadcast
      </Button>
    </form>
  );
}
