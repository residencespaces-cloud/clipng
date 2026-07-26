import { v2 as cloudinary } from "cloudinary";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 2 * 1024 * 1024; // 2MB

function configureCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });
}

export async function saveCampaignThumbnail(file: File): Promise<{ url: string }> {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Upload a JPG, PNG, WebP, or GIF image.");
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error("Thumbnail must be under 2MB.");
  }

  configureCloudinary();

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: process.env.CLOUDINARY_FOLDER ?? "kudiclip/campaigns",
      resource_type: "image",
      overwrite: false,
      unique_filename: true,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    if (!result.secure_url) {
      throw new Error("Cloudinary did not return an image URL.");
    }

    return { url: result.secure_url };
  } catch (e) {
    if (e instanceof Error && e.message.includes("Cloudinary is not configured")) {
      throw e;
    }
    const msg = e instanceof Error ? e.message : "Cloudinary upload failed";
    throw new Error(msg);
  }
}

export function isValidImageRef(url: string): boolean {
  const v = url.trim();
  if (!v) return false;
  if (v.startsWith("/uploads/")) return true;
  if (v.startsWith("data:image/")) return true;
  try {
    const parsed = new URL(v);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
