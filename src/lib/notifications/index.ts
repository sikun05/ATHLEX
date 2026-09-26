import "server-only";
import { site } from "@/lib/site";
import { getRepo } from "@/lib/db";
import { isServiceRoleConfigured, isSupabaseConfigured } from "@/lib/env";

/**
 * Multi-channel notification service.
 * Each channel activates only when its credentials exist; otherwise the message
 * is logged so flows keep working in development. Every notification is also
 * stored in the `notifications` table for the in-app feed / admin audit.
 */

export type NotificationType =
  | "registration"
  | "trial_booking"
  | "booking_confirmation"
  | "class_reminder"
  | "payment_confirmation"
  | "payment_failed"
  | "membership_expiry"
  | "membership_renewal"
  | "trainer_booking"
  | "contact_message"
  | "admin_alert";

type Recipient = { userId?: string | null; email?: string | null; phone?: string | null; name?: string | null };

type Message = { subject: string; text: string; html?: string };

const layout = (title: string, body: string) => `<!doctype html><html><body style="margin:0;background:#060606;font-family:Inter,Arial,sans-serif;color:#f3f3ef">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0c0c0d;border:1px solid #1e1e21;border-radius:8px">
<tr><td style="padding:28px 32px;border-bottom:1px solid #1e1e21"><span style="display:inline-block;background:#c8ff2e;color:#060606;font-weight:800;padding:4px 10px;border-radius:4px;letter-spacing:2px">ATHLEX</span></td></tr>
<tr><td style="padding:32px"><h1 style="margin:0 0 16px;font-size:24px;text-transform:uppercase;letter-spacing:.5px">${title}</h1>
<div style="font-size:15px;line-height:1.6;color:#c9c9c4">${body}</div></td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #1e1e21;font-size:12px;color:#9a9aa1">${site.name} · ${site.address.street}, ${site.address.city} · ${site.phone}</td></tr>
</table></td></tr></table></body></html>`;

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function template(type: NotificationType, data: Record<string, string | number | undefined | null>): Message {
  const d = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, escape(String(v ?? ""))]));
  switch (type) {
    case "registration":
      return { subject: `Welcome to ${site.name}, ${d.name}!`, text: `Hi ${d.name}, your ${site.name} account is ready. Log in to choose a plan, book classes and track your progress.` };
    case "trial_booking":
      return {
        subject: "Your free trial is booked",
        text: `Hi ${d.name}, your free ${d.interest} trial is booked for ${d.date} at ${d.time}. Bring training shoes, a towel and water. Reply to reschedule. – Team ${site.name}`,
      };
    case "booking_confirmation":
      return { subject: `Booked: ${d.className}`, text: `You're in! ${d.className} on ${d.date} at ${d.time} with ${d.trainer}. Cancel from your dashboard if plans change.` };
    case "class_reminder":
      return { subject: `Reminder: ${d.className} at ${d.time}`, text: `Heads up — ${d.className} starts at ${d.time} on ${d.date}. See you on the floor!` };
    case "payment_confirmation":
      return {
        subject: `Payment received — ${d.plan} membership active`,
        text: `Hi ${d.name}, we received ${d.amount}. Your ${d.plan} membership is active from ${d.start} to ${d.end}. Receipt: ${d.receipt}.`,
      };
    case "payment_failed":
      return { subject: "Payment unsuccessful", text: `Hi ${d.name}, your payment for the ${d.plan} plan didn't go through${d.reason ? ` (${d.reason})` : ""}. No money was taken — you can retry from the membership page.` };
    case "membership_expiry":
      return { subject: `Your membership expires in ${d.days} day(s)`, text: `Hi ${d.name}, your ${d.plan} membership ends on ${d.end}. Renew now to keep your streak going.` };
    case "membership_renewal":
      return { subject: "Membership renewed", text: `Hi ${d.name}, your ${d.plan} membership has been renewed until ${d.end}. Let's keep building.` };
    case "trainer_booking":
      return { subject: "PT session scheduled", text: `Your personal training session with ${d.trainer} is on ${d.date} at ${d.time}.` };
    case "contact_message":
      return { subject: `New enquiry: ${d.subject}`, text: `${d.name} (${d.email}) wrote: ${d.message}` };
    case "admin_alert":
      return { subject: `[${site.name} admin] ${d.title}`, text: String(d.body) };
  }
}

// ─── Channels ──────────────────────────────────────────────────────
async function sendEmail(to: string, msg: Message) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return log("email", to, msg.subject);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || `${site.name} <${site.email}>`, to, subject: msg.subject, text: msg.text, html: msg.html ?? layout(msg.subject, escape(msg.text).replace(/\n/g, "<br/>")) }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.status}`);
  return true;
}

async function sendWhatsApp(to: string, msg: Message) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return log("whatsapp", to, msg.text);
  // Note: outside the 24h customer-service window Meta requires approved templates.
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: to.replace(/\D/g, ""), type: "text", text: { body: `*${msg.subject}*\n${msg.text}` } }),
  });
  if (!res.ok) throw new Error(`WhatsApp failed: ${res.status}`);
  return true;
}

async function sendSms(to: string, msg: Message) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const auth = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !auth || !from) return log("sms", to, msg.text);
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${sid}:${auth}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: to, From: from, Body: `${site.name}: ${msg.text}`.slice(0, 480) }),
  });
  if (!res.ok) throw new Error(`SMS failed: ${res.status}`);
  return true;
}

function log(channel: string, to: string, text: string) {
  if (process.env.NODE_ENV !== "test") console.info(`[notify:${channel}] → ${to}: ${text}`);
  return true;
}

async function store(row: Record<string, unknown>) {
  try {
    // Notifications may target other users → needs privileged repo when Supabase is on.
    const repo = isSupabaseConfigured() ? (isServiceRoleConfigured() ? await getRepo("privileged") : null) : await getRepo();
    await repo?.insert("notifications", row);
  } catch (e) {
    console.warn("[notify] could not store notification", e);
  }
}

export async function notify(
  type: NotificationType,
  to: Recipient,
  data: Record<string, string | number | undefined | null>,
  channels: ("email" | "whatsapp" | "sms" | "in_app")[] = ["email", "whatsapp", "in_app"],
) {
  const msg = template(type, data);
  const results = await Promise.allSettled([
    channels.includes("email") && to.email ? sendEmail(to.email, msg) : null,
    channels.includes("whatsapp") && to.phone ? sendWhatsApp(to.phone, msg) : null,
    channels.includes("sms") && to.phone ? sendSms(to.phone, msg) : null,
  ]);
  const failed = results.filter((r) => r.status === "rejected");
  failed.forEach((f) => console.warn(`[notify:${type}]`, (f as PromiseRejectedResult).reason));
  if (channels.includes("in_app") && to.userId) {
    await store({ user_id: to.userId, channel: "in_app", type, title: msg.subject, body: msg.text, status: "sent", metadata: {} });
  }
  return { sent: results.length - failed.length, failed: failed.length };
}

/** Alert the front desk / owner. Stored in the admin feed (user_id = null). */
export async function notifyAdmin(title: string, body: string, type: NotificationType = "admin_alert") {
  const msg = template("admin_alert", { title, body });
  await Promise.allSettled([
    process.env.ADMIN_NOTIFY_EMAIL ? sendEmail(process.env.ADMIN_NOTIFY_EMAIL, msg) : log("email", "admin", msg.subject),
    process.env.ADMIN_NOTIFY_WHATSAPP ? sendWhatsApp(process.env.ADMIN_NOTIFY_WHATSAPP, msg) : null,
  ]);
  await store({ user_id: null, channel: "in_app", type, title, body, status: "sent", metadata: {} });
}
