import type { Product } from "../garments";

/**
 * Amazon Creators API product provider (replaces PA-API 5.0, which retires
 * ~May 15 2026). Auth is OAuth 2.0 client-credentials (Login with Amazon);
 * the product search is POST /catalog/v1/searchItems with lowerCamelCase
 * fields mirroring PA-API's shape.
 *
 * IMPORTANT: Amazon's live docs are JS-rendered and the exact response
 * envelope could not be 100% confirmed at build time, so response parsing
 * below is deliberately defensive (accepts camelCase and PascalCase). Confirm
 * field paths against a live response once you have approved credentials.
 * Refs: https://affiliate-program.amazon.com/creatorsapi/docs/
 *
 * Required env: AMAZON_CREATORS_CLIENT_ID, AMAZON_CREATORS_CLIENT_SECRET,
 * AMAZON_PARTNER_TAG. Optional: AMAZON_MARKETPLACE (default www.amazon.in),
 * AMAZON_CREATORS_HOST, AMAZON_OAUTH_TOKEN_URL, AMAZON_CREATORS_SCOPE.
 */

const TOKEN_URL =
  process.env.AMAZON_OAUTH_TOKEN_URL || "https://api.amazon.com/auth/o2/token";
const HOST = process.env.AMAZON_CREATORS_HOST || "https://creatorsapi.amazon";
const MARKETPLACE = process.env.AMAZON_MARKETPLACE || "www.amazon.in";

let cachedToken: { value: string; expiresAt: number } | null = null;

function configured(): boolean {
  return Boolean(
    process.env.AMAZON_CREATORS_CLIENT_ID &&
      process.env.AMAZON_CREATORS_CLIENT_SECRET &&
      process.env.AMAZON_PARTNER_TAG,
  );
}

async function getToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.value;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.AMAZON_CREATORS_CLIENT_ID as string,
    client_secret: process.env.AMAZON_CREATORS_CLIENT_SECRET as string,
  });
  const scope = process.env.AMAZON_CREATORS_SCOPE;
  if (scope) body.set("scope", scope);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`Amazon OAuth failed (${res.status})`);
  }
  const json = await res.json();
  const token = json.access_token as string;
  const ttl = (json.expires_in ?? 3600) * 1000;
  cachedToken = { value: token, expiresAt: now + ttl };
  return token;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function pick(obj: any, ...paths: string[]): any {
  for (const path of paths) {
    let cur = obj;
    let ok = true;
    for (const key of path.split(".")) {
      if (cur && typeof cur === "object" && key in cur) cur = cur[key];
      else {
        ok = false;
        break;
      }
    }
    if (ok && cur != null) return cur;
  }
  return undefined;
}

function parseItem(item: any): Product | null {
  const title = pick(
    item,
    "itemInfo.title.displayValue",
    "ItemInfo.Title.DisplayValue",
    "title",
  );
  const buyUrl = pick(item, "detailPageUrl", "detailPageURL", "DetailPageURL", "url");
  if (!title || !buyUrl) return null;

  const listing = pick(item, "offers.listings", "Offers.Listings") ?? [];
  const price = Array.isArray(listing) ? listing[0]?.price ?? listing[0]?.Price : undefined;

  return {
    title: String(title),
    merchant: "Amazon",
    priceDisplay: pick(price ?? {}, "displayAmount", "DisplayAmount"),
    price: pick(price ?? {}, "amount", "Amount"),
    currency: pick(price ?? {}, "currency", "Currency"),
    imageUrl: pick(
      item,
      "images.primary.large.url",
      "Images.Primary.Large.URL",
      "images.primary.medium.url",
    ),
    buyUrl: String(buyUrl),
  };
}

export async function searchAmazon(
  query: string,
  opts?: { count?: number },
): Promise<Product[]> {
  if (!configured()) return [];

  const token = await getToken();
  const res = await fetch(`${HOST}/catalog/v1/searchItems`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      keywords: query,
      partnerTag: process.env.AMAZON_PARTNER_TAG,
      partnerType: "Associates",
      marketplace: MARKETPLACE,
      itemCount: opts?.count ?? 3,
      resources: ["ItemInfo.Title", "Offers.Listings.Price", "Images.Primary.Large"],
    }),
  });

  if (!res.ok) {
    throw new Error(`Amazon searchItems failed (${res.status})`);
  }

  const data = await res.json();
  const items =
    pick(data, "searchResult.items", "itemsResult.items", "items") ?? [];
  return (Array.isArray(items) ? items : [])
    .map(parseItem)
    .filter((p): p is Product => p !== null)
    .slice(0, opts?.count ?? 3);
}
/* eslint-enable @typescript-eslint/no-explicit-any */
