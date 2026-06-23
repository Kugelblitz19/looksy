/**
 * Provider-agnostic affiliate link wrapping.
 *
 * Two independent monetization paths, either or both can be on:
 *
 * 1. AGGREGATOR (covers all four merchants). Indian affiliate aggregators
 *    (Admitad, Cuelinks, EarnKaro, INRDeals…) expose a "deep link" that takes
 *    an encoded target URL. Paste your network's template — containing the
 *    literal `{url}` placeholder — into LOOKSY_AFFILIATE_TEMPLATE, e.g.
 *      LOOKSY_AFFILIATE_TEMPLATE=https://linksredirect.com/?cid=XXXXX&url={url}
 *
 * 2. AMAZON ASSOCIATES TAG (Amazon links only, no aggregator needed — the
 *    easiest program to join). Set AMAZON_PARTNER_TAG=yourtag-21 and every
 *    amazon.* link is stamped with `?tag=`. This monetizes the Shop-the-Look
 *    search links even when no aggregator and no Creators API are configured.
 *
 * With neither set, the raw merchant URL is returned (links still work, just
 * unmonetized).
 */

function isAmazon(rawUrl: string): boolean {
  try {
    return /(^|\.)amazon\./i.test(new URL(rawUrl).hostname);
  } catch {
    return false;
  }
}

function withParam(rawUrl: string, key: string, value: string): string {
  try {
    const u = new URL(rawUrl);
    if (!u.searchParams.has(key)) u.searchParams.set(key, value);
    return u.toString();
  } catch {
    return rawUrl;
  }
}

export function toAffiliateUrl(rawUrl: string): string {
  // An aggregator template monetizes every merchant — prefer it when present.
  const tpl = process.env.LOOKSY_AFFILIATE_TEMPLATE;
  if (tpl && tpl.includes("{url}")) {
    return tpl.replace("{url}", encodeURIComponent(rawUrl));
  }
  // Otherwise, natively tag Amazon links with the Associates partner tag.
  const tag = process.env.AMAZON_PARTNER_TAG;
  if (tag && isAmazon(rawUrl)) {
    return withParam(rawUrl, "tag", tag);
  }
  return rawUrl;
}

export function affiliateConfigured(): boolean {
  const tpl = process.env.LOOKSY_AFFILIATE_TEMPLATE;
  if (tpl && tpl.includes("{url}")) return true;
  return Boolean(process.env.AMAZON_PARTNER_TAG);
}
