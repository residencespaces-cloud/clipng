import { ok } from "@/server/services/auth.service";
import { jsonError, requireUser } from "@/server/auth";
import { createSubmission } from "@/server/services/submissions.service";

export async function POST(request: Request) {
  const auth = await requireUser(request, ["clipper"]);
  if (auth.error) return auth.error;
  try {
    const body = await request.json();
    return ok(await createSubmission(auth.user.id, body), 201);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed", 400);
  }
}
