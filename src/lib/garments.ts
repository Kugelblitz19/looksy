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
  currency?: string;
  imageUrl?: string;
  /** Affiliate-wrapped product page URL. */
  buyUrl: string;
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
