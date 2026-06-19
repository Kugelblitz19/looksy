import { MERCHANTS } from "./merchants";
import { toAffiliateUrl } from "./affiliate";
import type { DetectedGarment, ShopLink } from "./garments";

/**
 * For a detected garment, build one affiliate-wrapped "shop similar" link per
 * merchant. This is the no-API MVP: links land the shopper on real, relevant
 * search results. A future product-data provider can replace/augment this with
 * actual product cards (price, image, exact buy URL).
 */
export function buildShopLinks(garment: DetectedGarment): ShopLink[] {
  return MERCHANTS.map((m) => ({
    merchantId: m.id,
    merchant: m.name,
    url: toAffiliateUrl(m.search(garment.searchQuery)),
  }));
}
