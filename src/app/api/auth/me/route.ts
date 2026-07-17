import { getMe, ok } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";

export async function GET(request: Request) {
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  const me = await getMe(auth.user.id);
  if (!me) return jsonError("Unauthorized", 401);
  return ok(me);
}
