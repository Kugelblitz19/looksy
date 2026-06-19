import { NextRequest, NextResponse } from "next/server";
import { detectGarments, demoGarments } from "@/lib/detect";
import { buildShopLinks } from "@/lib/products";
import { affiliateConfigured } from "@/lib/affiliate";
import type { DetectedGarment, ShoppableGarment } from "@/lib/garments";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const imageDataUrl: unknown = body?.imageDataUrl;
    const aesthetics: string[] = Array.isArray(body?.aesthetics)
      ? body.aesthetics
      : [];

    const hasKey = Boolean(process.env.GEMINI_API_KEY);

    let garments: DetectedGarment[];
    const isRealImage =
      typeof imageDataUrl === "string" &&
      imageDataUrl.startsWith("data:image/") &&
      !imageDataUrl.startsWith("data:image/svg");

    if (hasKey && isRealImage) {
      const match = (imageDataUrl as string).match(/^data:(.*?);base64,(.*)$/s);
      if (match) {
        garments = await detectGarments({
          mimeType: match[1],
          imageBase64: match[2],
        });
      } else {
        garments = demoGarments(aesthetics);
      }
    } else {
      // Demo mode (or placeholder image): synthesize from chosen aesthetics.
      garments = demoGarments(aesthetics);
    }

    const shoppable: ShoppableGarment[] = garments.map((g) => ({
      ...g,
      shopLinks: buildShopLinks(g),
    }));

    return NextResponse.json({
      garments: shoppable,
      demo: !hasKey,
      monetized: affiliateConfigured(),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Shop lookup failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
