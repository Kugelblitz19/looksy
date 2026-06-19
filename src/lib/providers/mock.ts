import type { DetectedGarment, Product } from "../garments";
import { MERCHANTS } from "../merchants";
import { toAffiliateUrl } from "../affiliate";

const BRANDS = [
  "Roadster",
  "HRX",
  "Mast & Harbour",
  "HIGHLANDER",
  "Puma",
  "Levi's",
  "H&M",
  "Bewakoof",
];

/** Deterministic pseudo-value from a string (no Math.random — stable output). */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function placeholderImage(title: string, seed: number): string {
  const palettes = [
    ["#5f27cd", "#341f97"],
    ["#ee5253", "#ff9f43"],
    ["#0abde3", "#10ac84"],
    ["#576574", "#222f3e"],
  ];
  const [c1, c2] = palettes[seed % palettes.length];
  const safe = title.replace(/[<>&]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><text x="200" y="250" font-family="system-ui,sans-serif" font-size="22" fill="rgba(255,255,255,0.92)" text-anchor="middle">${safe}</text><text x="200" y="285" font-family="system-ui,sans-serif" font-size="14" fill="rgba(255,255,255,0.6)" text-anchor="middle">mock product</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/**
 * Returns realistic-looking fake products so the product-card UI can be built
 * and demoed without any external API. Buy links point at real merchant search
 * results (affiliate-wrapped), so even mock cards are clickable to a real page.
 */
export function searchMock(
  garment: DetectedGarment,
  opts?: { count?: number },
): Product[] {
  const count = opts?.count ?? 3;
  const base = hash(garment.searchQuery);

  return Array.from({ length: count }).map((_, i) => {
    const seed = base + i * 7;
    const brand = BRANDS[seed % BRANDS.length];
    const merchant = MERCHANTS[seed % MERCHANTS.length];
    const price = 599 + (seed % 38) * 50; // ₹599 – ₹2449, deterministic
    const title = `${brand} ${garment.name}`;
    return {
      title,
      merchant: merchant.name,
      price,
      currency: "INR",
      priceDisplay: `₹${price.toLocaleString("en-IN")}`,
      imageUrl: placeholderImage(title, seed),
      buyUrl: toAffiliateUrl(merchant.search(garment.searchQuery)),
    };
  });
}
