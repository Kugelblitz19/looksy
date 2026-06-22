export interface DetectedGarment {
  /** Short human label, e.g. "Oversized hoodie". */
  name: string;
  /** top | bottom | outerwear | dress | footwear | accessory | other */
  category: string;
  color?: string;
  /** men | women | unisex */
  gender?: string;
  /** Concise phrase used to search shopping sites for a similar product. */
  searchQuery: string;
}

export interface ShopLink {
  merchantId: string;
  merchant: string;
  /** Affiliate-wrapped (if configured) URL to the merchant's results. */
  url: string;
}

/** A real, buyable product returned by a product-data provider. */
export interface Product {
  title: string;
  merchant: string;
  /** Pre-formatted price, e.g. "₹1,299". */
  priceDisplay?: string;
  price?: number;
  /** Original ("MRP") price before discount, when on sale. */
  mrp?: number;
  currency?: string;
  imageUrl?: string;
  /** Affiliate-wrapped product page URL. */
  buyUrl: string;
}

/**
 * Build the shop search phrase for a garment, prefixing gender when known so
 * results match (a top reason shop clicks bounce). Size will fold in here once
 * the Style profile lands.
 */
export function searchQueryFor(g: DetectedGarment): string {
  const q = g.searchQuery.trim();
  const gender = g.gender?.toLowerCase();
  if (
    (gender === "men" || gender === "women") &&
    !new RegExp(`\\b${gender}\\b`, "i").test(q) &&
    !/\b(unisex|women|men)\b/i.test(q)
  ) {
    return `${gender} ${q}`;
  }
  return q;
}

/**
 * Bias a garment list toward the look's gender so shop searches return men's /
 * women's products. Only fills unisex or unknown items — explicit gendered
 * items are left as detected.
 */
export function withPreferredGender(
  garments: DetectedGarment[],
  gender?: "man" | "woman",
): DetectedGarment[] {
  if (gender !== "man" && gender !== "woman") return garments;
  const target = gender === "man" ? "men" : "women";
  return garments.map((g) => {
    const cur = g.gender?.toLowerCase();
    return !cur || cur === "unisex" ? { ...g, gender: target } : g;
  });
}

export interface ShoppableGarment extends DetectedGarment {
  /** Real product cards (when a product provider is configured). */
  products: Product[];
  /** Fallback "shop similar" merchant search links. */
  shopLinks: ShopLink[];
}

export interface ShopResponse {
  garments?: ShoppableGarment[];
  demo?: boolean;
  /** True when buy-links are monetized via an affiliate template. */
  monetized?: boolean;
  /** Which product-data provider produced the cards (searchlinks|mock|amazon). */
  productProvider?: string;
  error?: string;
}
