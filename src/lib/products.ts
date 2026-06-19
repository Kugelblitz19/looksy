import { MERCHANTS } from "./merchants";
import { toAffiliateUrl } from "./affiliate";
import { searchMock } from "./providers/mock";
import { searchAmazon } from "./providers/amazon";
import type { DetectedGarment, Product, ShopLink } from "./garments";

/**
 * For a detected garment, build one affiliate-wrapped "shop similar" link per
 * merchant. Always available — used as the fallback when no product-data
 * provider returns real product cards.
 */
export function buildShopLinks(garment: DetectedGarment): ShopLink[] {
  return MERCHANTS.map((m) => ({
    merchantId: m.id,
    merchant: m.name,
    url: toAffiliateUrl(m.search(garment.searchQuery)),
  }));
}

export function activeProductProvider(): string {
  return process.env.LOOKSY_PRODUCT_PROVIDER || "searchlinks";
}

/**
 * Fetch real product cards for a garment from the configured provider. Fails
 * safe to an empty array (the UI then falls back to merchant search links).
 */
export async function searchProducts(
  garment: DetectedGarment,
  opts?: { count?: number },
): Promise<Product[]> {
  try {
    switch (activeProductProvider()) {
      case "amazon":
        return await searchAmazon(garment.searchQuery, opts);
      case "mock":
        return searchMock(garment, opts);
      default:
        return [];
    }
  } catch {
    return [];
  }
}
