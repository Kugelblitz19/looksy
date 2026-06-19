/**
 * Provider-agnostic affiliate link wrapping.
 *
 * Indian affiliate aggregators (Cuelinks, EarnKaro, INRDeals, Admitad…) and
 * single programs all expose a "deep link" that takes an encoded target URL.
 * Rather than hard-code one provider, the owner pastes their network's deep
 * link template — containing the literal `{url}` placeholder — into the
 * LOOKSY_AFFILIATE_TEMPLATE env var. Example (Cuelinks-style):
 *
 *   LOOKSY_AFFILIATE_TEMPLATE=https://linksredirect.com/?cid=XXXXX&source=looksy&url={url}
 *
 * With no template set, the raw merchant URL is returned (links still work,
 * just unmonetized).
 */
export function toAffiliateUrl(rawUrl: string): string {
  const tpl = process.env.LOOKSY_AFFILIATE_TEMPLATE;
  if (tpl && tpl.includes("{url}")) {
    return tpl.replace("{url}", encodeURIComponent(rawUrl));
  }
  return rawUrl;
}

export function affiliateConfigured(): boolean {
  const tpl = process.env.LOOKSY_AFFILIATE_TEMPLATE;
  return Boolean(tpl && tpl.includes("{url}"));
}
