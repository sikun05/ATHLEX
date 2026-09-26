import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await getCurrentUser();
  return NextResponse.json(
    { ok: true, data: u ? { id: u.id, name: u.name, email: u.email, role: u.role } : null },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
