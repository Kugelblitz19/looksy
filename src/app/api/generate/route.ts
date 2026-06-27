import { NextRequest, NextResponse } from "next/server";
import { generateStyledImage } from "@/lib/gemini";
import { generateFreeImage } from "@/lib/freeImage";
import { buildPrompt } from "@/lib/stylist";
import { isEthnicity } from "@/lib/ethnicity";
import { placeholderDataUrl } from "@/lib/placeholder";
import { isAuthenticated } from "@/lib/auth/current";
import { rateLimit } from "@/lib/ratelimit";
import { screenPrompt } from "@/lib/moderation";
import type { GeneratedLook } from "@/lib/types";

export const runtime = "nodejs";
// Vercel Hobby hard-caps serverless functions at 60s — stay under it so a slow
// 4-up returns gracefully instead of being killed mid-flight (which hung the client).
export const maxDuration = 55;

const MAX_PHOTOS = 4;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8 MB per uploaded photo

export async function POST(req: NextRequest) {
  try {
    const authed = await isAuthenticated();
    let isGuest = false;
    if (!authed) {
      // Guest trial: one free look before signup, gated by a cookie.
      if (req.cookies.get("looksy_trial")?.value === "used") {
        return NextResponse.json(
          { error: "That was your free look — sign up free to keep going.", needAuth: true },
          { status: 401 },
        );
      }
      isGuest = true;
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const { limited } = await rateLimit(`gen:${ip}`, { max: 5, windowMs: 60_000 });
    if (limited) {
      return NextResponse.json(
        { error: "You're generating very fast — give it a few seconds." },
        { status: 429 },
      );
    }

    const form = await req.formData();

    const userPrompt = (form.get("prompt") as string) || "";
    const genderRaw = (form.get("gender") as string) || "";
    const gender =
      genderRaw === "man" || genderRaw === "woman" ? genderRaw : undefined;
    const ethnicityRaw = (form.get("ethnicity") as string) || "";
    const ethnicity = isEthnicity(ethnicityRaw) ? ethnicityRaw : "indian";
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
    // Guests get exactly one look per trial.
    const effectiveCount = isGuest ? 1 : count;

    if (!userPrompt.trim() && aestheticIds.length === 0) {
      return NextResponse.json(
        { error: "Pick a vibe or describe the look you want." },
        { status: 400 },
      );
    }

    const screen = screenPrompt(userPrompt);
    if (!screen.ok) {
      return NextResponse.json({ error: screen.reason }, { status: 400 });
    }

    const files = form
      .getAll("photos")
      .filter((f): f is File => f instanceof File)
      .slice(0, MAX_PHOTOS);

    const images: { mimeType: string; base64: string }[] = [];
    for (const f of files) {
      const buf = Buffer.from(await f.arrayBuffer());
      if (buf.length > MAX_PHOTO_BYTES) {
        return NextResponse.json(
          { error: "Each photo must be under 8 MB." },
          { status: 400 },
        );
      }
      if (!(f.type || "").startsWith("image/")) continue;
      images.push({
        mimeType: f.type || "image/jpeg",
        base64: buf.toString("base64"),
      });
    }

    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    const stamp = Date.now();

    const looks = await Promise.all(
      Array.from({ length: effectiveCount }).map(async (_, i): Promise<GeneratedLook> => {
        const prompt = buildPrompt({
          aestheticIds,
          userPrompt,
          hasPhotos: images.length > 0,
          gender,
          ethnicity,
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
            ethnicity,
            variation: i,
          });
          // Small stagger to avoid a burst rate-limit, then run in parallel —
          // not a 5s-per-image queue (that made a 4-up take a minute+).
          if (i > 0) await new Promise((r) => setTimeout(r, i * 800));
          // Retry to get a real image, but stay well within the 55s budget:
          // 2 attempts × ~12s timeout + short backoff. The client's Stop
          // (req.signal) cancels the in-flight fetch.
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              const dataUrl = await generateFreeImage({
                prompt: demoPrompt,
                seed: (stamp % 1_000_000) + i * 7919 + attempt * 131,
                signal: req.signal,
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
              await new Promise((r) => setTimeout(r, 800 + attempt * 800));
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

    const response = NextResponse.json({ looks, demo: !hasKey, guest: isGuest });
    if (isGuest) {
      response.cookies.set("looksy_trial", "used", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
