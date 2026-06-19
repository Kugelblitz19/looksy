import type { DetectedGarment } from "./garments";

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";

const DETECT_PROMPT =
  "You are a fashion stylist tagging an outfit for shopping. Look at the person " +
  "in this image and list each distinct wearable item (clothing, footwear and " +
  "notable accessories). Return 3 to 6 items. For each: name (2-4 words), " +
  "category (one of: top, bottom, outerwear, dress, footwear, accessory), color, " +
  "gender (men, women or unisex), and searchQuery (a concise phrase to find a " +
  'SIMILAR real product on an Indian shopping site, e.g. "men beige cargo pants").';

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    garments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: { type: "string" },
          color: { type: "string" },
          gender: { type: "string" },
          searchQuery: { type: "string" },
        },
        required: ["name", "category", "searchQuery"],
      },
    },
  },
  required: ["garments"],
};

/** Uses Gemini vision to extract shoppable garments from a generated look. */
export async function detectGarments(opts: {
  imageBase64: string;
  mimeType: string;
}): Promise<DetectedGarment[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("NO_API_KEY");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: DETECT_PROMPT },
            { inlineData: { mimeType: opts.mimeType, data: opts.imageBase64 } },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Gemini detect error ${res.status}: ${t.slice(0, 300)}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text)
      .filter(Boolean)
      .join("") ?? "";

  let parsed: { garments?: unknown[] } = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = {};
  }

  const list = Array.isArray(parsed.garments) ? parsed.garments : [];
  return list
    .map((g): DetectedGarment => {
      const item = g as Record<string, unknown>;
      return {
        name: String(item.name ?? "Item"),
        category: String(item.category ?? "other"),
        color: item.color ? String(item.color) : undefined,
        gender: item.gender ? String(item.gender) : undefined,
        searchQuery: String(item.searchQuery ?? item.name ?? "").trim(),
      };
    })
    .filter((g) => g.searchQuery.length > 0)
    .slice(0, 6);
}

/** Canonical garments per aesthetic, used in demo mode (no API key). */
const DEMO_MAP: Record<string, DetectedGarment[]> = {
  streetwear: [
    { name: "Oversized hoodie", category: "top", gender: "unisex", searchQuery: "oversized hoodie" },
    { name: "Cargo pants", category: "bottom", gender: "men", searchQuery: "men cargo pants" },
    { name: "Chunky sneakers", category: "footwear", gender: "unisex", searchQuery: "chunky sneakers" },
  ],
  party: [
    { name: "Sequin shirt", category: "top", gender: "unisex", searchQuery: "sequin party shirt" },
    { name: "Slim trousers", category: "bottom", gender: "unisex", searchQuery: "slim fit trousers" },
    { name: "Chelsea boots", category: "footwear", gender: "unisex", searchQuery: "chelsea boots" },
  ],
  workout: [
    { name: "Training tee", category: "top", gender: "unisex", searchQuery: "dry fit training t-shirt" },
    { name: "Track joggers", category: "bottom", gender: "unisex", searchQuery: "track joggers" },
    { name: "Running shoes", category: "footwear", gender: "unisex", searchQuery: "running shoes" },
  ],
  oldmoney: [
    { name: "Cashmere knit", category: "top", gender: "unisex", searchQuery: "cashmere sweater" },
    { name: "Pleated trousers", category: "bottom", gender: "unisex", searchQuery: "pleated trousers" },
    { name: "Leather loafers", category: "footwear", gender: "unisex", searchQuery: "leather loafers" },
  ],
  minimal: [
    { name: "White tee", category: "top", gender: "unisex", searchQuery: "plain white t-shirt" },
    { name: "Tailored trousers", category: "bottom", gender: "unisex", searchQuery: "tailored trousers" },
    { name: "Minimal sneakers", category: "footwear", gender: "unisex", searchQuery: "white minimal sneakers" },
  ],
  business: [
    { name: "Tailored blazer", category: "outerwear", gender: "unisex", searchQuery: "tailored blazer" },
    { name: "Dress shirt", category: "top", gender: "unisex", searchQuery: "formal dress shirt" },
    { name: "Oxford shoes", category: "footwear", gender: "unisex", searchQuery: "oxford formal shoes" },
  ],
  y2k: [
    { name: "Baby tee", category: "top", gender: "women", searchQuery: "y2k baby tee" },
    { name: "Low-rise jeans", category: "bottom", gender: "unisex", searchQuery: "low rise jeans" },
    { name: "Tinted sunglasses", category: "accessory", gender: "unisex", searchQuery: "tinted sunglasses" },
  ],
  festive: [
    { name: "Embroidered kurta", category: "top", gender: "unisex", searchQuery: "embroidered kurta" },
    { name: "Ethnic juttis", category: "footwear", gender: "unisex", searchQuery: "ethnic juttis" },
  ],
  casual: [
    { name: "Cotton tee", category: "top", gender: "unisex", searchQuery: "cotton t-shirt" },
    { name: "Slim jeans", category: "bottom", gender: "unisex", searchQuery: "slim fit jeans" },
    { name: "White sneakers", category: "footwear", gender: "unisex", searchQuery: "white sneakers" },
  ],
  techwear: [
    { name: "Shell jacket", category: "outerwear", gender: "unisex", searchQuery: "techwear shell jacket" },
    { name: "Cargo joggers", category: "bottom", gender: "unisex", searchQuery: "cargo joggers black" },
    { name: "Tactical boots", category: "footwear", gender: "unisex", searchQuery: "tactical boots" },
  ],
};

/** Best-effort garment list for demo mode, derived from chosen aesthetics. */
export function demoGarments(aestheticIds: string[]): DetectedGarment[] {
  const out: DetectedGarment[] = [];
  for (const id of aestheticIds) {
    const g = DEMO_MAP[id];
    if (g) out.push(...g);
  }
  if (out.length === 0) {
    out.push({ name: "Everyday tee", category: "top", gender: "unisex", searchQuery: "cotton t-shirt" });
  }
  const seen = new Set<string>();
  const deduped: DetectedGarment[] = [];
  for (const g of out) {
    if (!seen.has(g.searchQuery)) {
      seen.add(g.searchQuery);
      deduped.push(g);
    }
  }
  return deduped.slice(0, 6);
}
