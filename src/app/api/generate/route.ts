import { NextRequest, NextResponse } from "next/server";
import { generateStyledImage } from "@/lib/gemini";
import { generateFreeImage } from "@/lib/freeImage";
import { buildPrompt } from "@/lib/stylist";
import { placeholderDataUrl } from "@/lib/placeholder";
import { isAuthenticated } from "@/lib/auth/current";
import type { GeneratedLook } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PHOTOS = 4;

export async function POST(req: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const form = await req.formData();

    const userPrompt = (form.get("prompt") as string) || "";
    const genderRaw = (form.get("gender") as string) || "";
    const gender =
      genderRaw === "man" || genderRaw === "woman" ? genderRaw : undefined;
    let aestheticIds: string[] = [];
    try {
      aestheticIds = JSON.parse((form.get("aesthetics") as string) || "[]");
    } catch {
      aestheticIds = [];
    }
    const count = Math.min(
      Math.max(parseInt((form.get("count") as string) || "2", 10) || 2, 1),
      4,
    );

    if (!userPrompt.trim() && aestheticIds.length === 0) {
      return NextResponse.json(
        { error: "Pick a vibe or describe the look you want." },
        { status: 400 },
      );
    }

    const files = form
      .getAll("photos")
      .filter((f): f is File => f instanceof File)
      .slice(0, MAX_PHOTOS);

    const images: { mimeType: string; base64: string }[] = [];
    for (const f of files) {
      const buf = Buffer.from(await f.arrayBuffer());
      images.push({
        mimeType: f.type || "image/jpeg",
        base64: buf.toString("base64"),
      });
    }

    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    const stamp = Date.now();

    const looks = await Promise.all(
      Array.from({ length: count }).map(async (_, i): Promise<GeneratedLook> => {
        const prompt = buildPrompt({
          aestheticIds,
          userPrompt,
          hasPhotos: images.length > 0,
          gender,
          variation: i,
        });

        if (!hasKey) {
          // Free generator (no key/card): a real AI fashion image of a generic
          // model — text-to-image, so it can't be the user's actual face.
          const demoPrompt = buildPrompt({
            aestheticIds,
            userPrompt,
            hasPhotos: false,
            gender,
            variation: i,
          });
          // Stagger calls — the free API rate-limits concurrent requests.
          if (i > 0) await new Promise((r) => setTimeout(r, i * 5000));
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              const dataUrl = await generateFreeImage({
                prompt: demoPrompt,
                seed: (stamp % 1_000_000) + i * 7919 + attempt * 131,
              });
              return {
                id: `${stamp}-${i}`,
                imageUrl: dataUrl,
                aesthetics: aestheticIds,
                prompt: demoPrompt,
                gender,
                demo: true,
              };
            } catch {
              if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
            }
          }
          return {
            id: `${stamp}-${i}`,
            imageUrl: placeholderDataUrl(aestheticIds, i),
            aesthetics: aestheticIds,
            prompt: demoPrompt,
            gender,
            demo: true,
          };
        }

        const out = await generateStyledImage({ prompt, images });
        return {
          id: `${stamp}-${i}`,
          imageUrl: `data:${out.mimeType};base64,${out.base64}`,
          aesthetics: aestheticIds,
          prompt,
          gender,
        };
      }),
    );

    return NextResponse.json({ looks, demo: !hasKey });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
