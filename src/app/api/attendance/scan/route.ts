import { assertSameOrigin, authorize, handler, ok, parseBody } from "@/lib/api";
import { DESK_ROLES } from "@/lib/auth/session";
import { recordScan } from "@/lib/attendance";
import { attendanceScanSchema } from "@/lib/validation";

export const POST = handler(async (req) => {
  await assertSameOrigin(req);
  const desk = await authorize(DESK_ROLES);
  const input = await parseBody(req, attendanceScanSchema);
  return ok(await recordScan(desk, input));
});
