import { randomUUID } from "crypto";
import { createAdminClient } from "./admin";

const BUCKET = "looks";
const SIGNED_TTL = 60 * 60; // 1 hour

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

/** A stored value is a Storage path (not an http/data URL). */
export function isStoragePath(value: string): boolean {
  return !value.startsWith("http") && !value.startsWith("data:");
}

/**
 * Uploads a data-URL image to the PRIVATE bucket under the user's folder and
 * returns the storage path. Throws on failure (callers fall back to inline).
 */
export async function uploadDataUrl(
  userId: string,
  dataUrl: string,
): Promise<string> {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/s);
  if (!match) throw new Error("Not a data URL");
  const mime = match[1];
  const bytes = Buffer.from(match[2], "base64");
  const ext = EXT[mime] ?? "png";
  const path = `${userId}/${randomUUID()}.${ext}`;

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: mime, upsert: false });
  if (error) throw error;
  return path;
}

/**
 * Converts a stored value into something an <img> can render: a short-lived
 * signed URL for Storage paths, or the value as-is for legacy data/http URLs.
 */
export async function toDisplayUrl(stored: string): Promise<string> {
  if (!isStoragePath(stored)) return stored;
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(stored, SIGNED_TTL);
  return error || !data ? stored : data.signedUrl;
}

/** Best-effort removal of a stored object (no-op for legacy inline images). */
export async function removeStored(stored: string): Promise<void> {
  if (!isStoragePath(stored)) return;
  const admin = createAdminClient();
  await admin.storage.from(BUCKET).remove([stored]);
}
