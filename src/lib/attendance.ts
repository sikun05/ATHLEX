import "server-only";
import { randomBytes } from "node:crypto";
import { signToken, verifyToken } from "@/lib/auth/token";
import { ApiError } from "@/lib/api";
import { getRepo, eq, gte } from "@/lib/db";
import { getActiveMembership } from "@/lib/members";
import type { SessionUser } from "@/lib/auth/session";
import { isServiceRoleConfigured, isSupabaseConfigured } from "@/lib/env";

export const QR_TTL_MS = 60_000;
const usedNonces = new Map<string, number>();

/** Short-lived signed QR payload. Rotates every minute so screenshots can't be reused. */
export function issueAttendanceToken(memberId: string) {
  const exp = Date.now() + QR_TTL_MS;
  return { token: `ATX1.${signToken({ mid: memberId, n: randomBytes(6).toString("hex"), exp }, "attendance")}`, exp };
}

/** Desk scan: verify token → verify membership → mark attendance (check-in or check-out). */
export async function recordScan(desk: SessionUser, input: { token?: string; memberCode?: string }) {
  // Caller is already authorised as desk staff; read memberships with elevated rights so
  // trainers can verify members who aren't assigned to them.
  const mode = !isSupabaseConfigured() || isServiceRoleConfigured() ? "privileged" : "user";
  const repo = await getRepo(mode);
  let memberId: string | null = null;
  let method: "qr" | "manual" = "qr";

  if (input.token) {
    const raw = input.token.startsWith("ATX1.") ? input.token.slice(5) : input.token;
    const payload = verifyToken<{ mid: string; n: string }>(raw, "attendance");
    if (!payload) throw new ApiError(400, "QR code expired or invalid — ask the member to refresh their code.", "BAD_TOKEN");
    const now = Date.now();
    for (const [k, v] of usedNonces) if (v < now) usedNonces.delete(k);
    if (usedNonces.has(payload.n)) throw new ApiError(409, "This QR code was already used. Ask the member to refresh it.", "REPLAY");
    usedNonces.set(payload.n, payload.exp);
    memberId = payload.mid;
  } else if (input.memberCode) {
    const m = await repo.findOne("members", [eq("member_code", input.memberCode)]);
    if (!m) throw new ApiError(404, "No member with that code.", "NOT_FOUND");
    memberId = m.id;
    method = "manual";
  } else {
    throw new ApiError(422, "Scan a QR code or enter a member code.");
  }

  const member = await repo.get("members", memberId!);
  if (!member || member.deleted_at) throw new ApiError(404, "Member not found.", "NOT_FOUND");
  const user = await repo.get("users", member.user_id);
  const membership = await getActiveMembership(member.id, mode);
  const base = { member: { name: user?.full_name ?? "Member", code: member.member_code, photo: user?.avatar_url ?? null } };

  if (!membership || member.status !== "active") {
    return { ...base, result: "denied" as const, reason: !membership ? "No active membership" : "Member account inactive" };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const today = await repo.list("attendance", { filters: [eq("member_id", member.id), gte("check_in_at", startOfDay.toISOString())], order: [{ col: "check_in_at", asc: false }], limit: 1 });
  const last = today[0];

  if (last && !last.check_out_at) {
    const minutes = (Date.now() - new Date(last.check_in_at).getTime()) / 60000;
    if (minutes < 10) return { ...base, result: "duplicate" as const, reason: "Already checked in a few minutes ago", plan: membership.plan?.name, daysRemaining: membership.daysRemaining };
    await repo.update("attendance", last.id, { check_out_at: new Date().toISOString() });
    return { ...base, result: "checked_out" as const, plan: membership.plan?.name, daysRemaining: membership.daysRemaining, minutes: Math.round(minutes) };
  }

  await repo.insert("attendance", { member_id: member.id, check_in_at: new Date().toISOString(), method, verified_by: desk.id });
  return { ...base, result: "checked_in" as const, plan: membership.plan?.name, daysRemaining: membership.daysRemaining };
}
