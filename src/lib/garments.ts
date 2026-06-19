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

export interface ShoppableGarment extends DetectedGarment {
  shopLinks: ShopLink[];
}

export interface ShopResponse {
  garments?: ShoppableGarment[];
  demo?: boolean;
  /** True when buy-links are monetized via an affiliate template. */
  monetized?: boolean;
  error?: string;
}
