/**
 * Free, no-key, no-card image generation via Pollinations (FLUX under the hood).
 * Used when no GEMINI_API_KEY is set: it produces a real AI fashion photo of a
 * generic model from the text prompt. It is text-to-image, so it can NOT put
 * the user's actual face in the look — that needs the paid Gemini path.
 */
const ENDPOINT = "https://image.pollinations.ai/prompt/";

export async function generateFreeImage(opts: {
  prompt: string;
  seed: number;
}): Promise<string> {
  const params = new URLSearchParams({
    width: "768",
    height: "1024",
    model: "flux",
    nologo: "true",
    seed: String(opts.seed),
  });
  const url = `${ENDPOINT}${encodeURIComponent(opts.prompt)}?${params}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Pollinations ${res.status}`);
    const mime = res.headers.get("content-type") || "image/jpeg";
    if (!mime.startsWith("image/")) throw new Error("Not an image response");
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${mime};base64,${buf.toString("base64")}`;
  } finally {
    clearTimeout(timeout);
  }
}
