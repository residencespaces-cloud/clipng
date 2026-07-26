import { jsonError, requireUser } from "@/server/auth";
import { ok } from "@/server/services/auth.service";
import { saveCampaignThumbnail } from "@/server/uploads";

export async function POST(request: Request) {
  const auth = await requireUser(request, ["funder"]);
  if (auth.error) return auth.error;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return jsonError("Choose an image file to upload");
    }
    return ok(await saveCampaignThumbnail(file), 201);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Upload failed", 400);
  }
}
