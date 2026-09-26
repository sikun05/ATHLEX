import "server-only";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { demoDb } from "@/lib/db/demo-store";
import { hashPassword } from "@/lib/db/demo-seed";
import { demoRepo } from "@/lib/db/demo-store";

/** Credential store for DEMO MODE only. Supabase Auth replaces all of this in production. */
function verifyHash(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const test = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, "hex");
  return expected.length === test.length && timingSafeEqual(expected, test);
}

export function demoVerify(email: string, password: string) {
  const cred = demoDb().auth_credentials.find((c) => c.email === email.toLowerCase());
  // Constant-ish work even for unknown emails
  if (!cred) {
    verifyHash(password, "00000000000000000000000000000000:" + "0".repeat(64));
    return null;
  }
  return verifyHash(password, cred.password_hash) ? (cred.user_id as string) : null;
}

export async function demoSignup(input: { email: string; password: string; fullName: string; phone: string }) {
  const db = demoDb();
  if (db.auth_credentials.some((c) => c.email === input.email)) return { error: "An account with this email already exists." as const };
  const user = await demoRepo.insert("users", { email: input.email, full_name: input.fullName, phone: input.phone, avatar_url: null, role: "member", status: "active" });
  const count = db.members.length;
  await demoRepo.insert("members", { user_id: user.id, member_code: `ATX-${1001 + count + 50}`, joined_at: new Date().toISOString().slice(0, 10), status: "active", assigned_trainer_id: null });
  db.auth_credentials.push({ user_id: user.id, email: input.email, password_hash: hashPassword(input.password), email_verified: true });
  return { userId: user.id as string };
}

export function demoSetPassword(userId: string, password: string) {
  const cred = demoDb().auth_credentials.find((c) => c.user_id === userId);
  if (cred) cred.password_hash = hashPassword(password);
  return Boolean(cred);
}

export function demoFindUserIdByEmail(email: string) {
  return (demoDb().auth_credentials.find((c) => c.email === email)?.user_id as string | undefined) ?? null;
}
