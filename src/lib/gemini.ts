const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

export interface InputImage {
  mimeType: string;
  base64: string;
}

export interface GeminiImageResult {
  mimeType: string;
  base64: string;
}

/**
 * Calls Gemini's image model ("Nano Banana") with a text prompt plus optional
 * reference photos and returns the first generated image. Throws on failure so
 * the route handler can surface a clear message to the UI.
 */
export async function generateStyledImage(opts: {
  prompt: string;
  images: InputImage[];
}): Promise<GeminiImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const parts: Array<Record<string, unknown>> = [{ text: opts.prompt }];
  for (const img of opts.images) {
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({ contents: [{ parts }] }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}: ${text.slice(0, 400)}`);
  }

  const data = await res.json();
  const outParts = data?.candidates?.[0]?.content?.parts ?? [];

  for (const p of outParts) {
    // The JSON REST API returns camelCase, but be defensive about snake_case.
    const inline = p.inlineData ?? p.inline_data;
    if (inline?.data) {
      return {
        mimeType: inline.mimeType ?? inline.mime_type ?? "image/png",
        base64: inline.data,
      };
    }
  }

  // No image part — surface any text the model returned (often a refusal/why).
  const textPart = outParts.find((p: { text?: string }) => p.text)?.text;
  throw new Error(
    `The model did not return an image.${textPart ? ` It said: "${textPart.slice(0, 200)}"` : ""}`,
  );
}
