import { randomUUID } from "node:crypto";
import { ApiError, assertSameOrigin, authorize, handler, limit, ok } from "@/lib/api";
import { getRepo } from "@/lib/db";

const MAX = 5 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export const POST = handler(async (req) => {
  await assertSameOrigin(req);
  const user = await authorize();
  if (!user.memberId) throw new ApiError(400, "No member profile");
  await limit("photo", 20, 60 * 60_000);

  const form = await req.formData();
  const file = form.get("file");
  const caption = String(form.get("caption") ?? "").slice(0, 120);
  const takenOn = String(form.get("takenOn") ?? "").match(/^\d{4}-\d{2}-\d{2}$/) ? String(form.get("takenOn")) : new Date().toISOString().slice(0, 10);
  if (!(file instanceof File)) throw new ApiError(422, "Choose a photo to upload.");
  if (!TYPES[file.type]) throw new ApiError(422, "Photos must be JPG, PNG or WebP.");
  if (file.size > MAX) throw new ApiError(422, "Photos must be under 5 MB.");

  const repo = await getRepo("user");
  let storagePath: string;
  if (repo.kind === "supabase") {
    const { getServerSupabase } = await import("@/lib/supabase/server");
    const sb = await getServerSupabase();
    storagePath = `${user.id}/${randomUUID()}.${TYPES[file.type]}`;
    const { error } = await sb.storage.from("progress-photos").upload(storagePath, file, { contentType: file.type, upsert: false });
    if (error) throw new ApiError(500, "Upload failed. Please try again.");
  } else {
    if (file.size > 1.5 * 1024 * 1024) throw new ApiError(422, "Demo mode stores photos in memory — please use an image under 1.5 MB.");
    storagePath = `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
  }
  const row = await repo.insert("progress_photos", { member_id: user.memberId, storage_path: storagePath, taken_on: takenOn, caption: caption || null });
  return ok({ id: row.id }, { status: 201 });
});
