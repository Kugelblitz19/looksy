import { NextRequest, NextResponse } from "next/server";
import { detectGarments, demoGarments } from "@/lib/detect";
import { buildShopLinks, searchProducts, activeProductProvider } from "@/lib/products";
import { affiliateConfigured } from "@/lib/affiliate";
import { isAuthenticated } from "@/lib/auth/current";
import { withPreferredGender } from "@/lib/garments";
import { rankByMatch, bestMatch, lookMatch } from "@/lib/match";
import type { DetectedGarment, ShoppableGarment } from "@/lib/garments";

export const runtime = "nodejs";
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const imageDataUrl: unknown = body?.imageDataUrl;
    const aesthetics: string[] = Array.isArray(body?.aesthetics)
      ? body.aesthetics
      : [];
    const genderRaw = typeof body?.gender === "string" ? body.gender : "";
    const gender =
      genderRaw === "man" || genderRaw === "woman" ? genderRaw : undefined;

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

    garments = withPreferredGender(garments, gender);

    const shoppable: ShoppableGarment[] = await Promise.all(
      garments.map(async (g) => {
        // Rank the real products closest-match-first, so the most exact item
        // surfaces, and stamp the garment with its best match score.
        const products = rankByMatch(g, await searchProducts(g, { count: 3 }));
        return {
          ...g,
          products,
          shopLinks: buildShopLinks(g),
          match: bestMatch(products),
        };
      }),
    );

    const overall = lookMatch(
      shoppable
        .map((g) => g.match)
        .filter((m): m is number => typeof m === "number"),
    );

    return NextResponse.json({
      garments: shoppable,
      demo: !hasKey,
      monetized: affiliateConfigured(),
      productProvider: activeProductProvider(),
      lookMatch: overall,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Shop lookup failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
