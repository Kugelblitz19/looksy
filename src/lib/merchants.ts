export interface Merchant {
  id: string;
  name: string;
  /** Builds a real search-results URL on the merchant for a query. */
  search: (query: string) => string;
}

const slug = (q: string) =>
  q.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

/**
 * India fashion merchants. These build real search URLs so a "shop similar"
 * link works today — even before a product-data API is wired in. Once an
 * affiliate network is configured, each URL is wrapped for commission.
 */
export const MERCHANTS: Merchant[] = [
  {
    id: "myntra",
    name: "Myntra",
    search: (q) =>
      `https://www.myntra.com/${slug(q)}?rawQuery=${encodeURIComponent(q)}`,
  },
  {
    id: "flipkart",
    name: "Flipkart",
    search: (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id: "ajio",
    name: "Ajio",
    search: (q) => `https://www.ajio.com/search/?text=${encodeURIComponent(q)}`,
  },
  {
    id: "amazon",
    name: "Amazon",
    search: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
  },
];
