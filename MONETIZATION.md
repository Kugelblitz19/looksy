# Making Shop-the-Look earn money

Looksy's buy links can earn affiliate commission when someone purchases. The
code is already wired — you just add your IDs to `.env.local` (locally) and to
your host's environment variables (in production). No code changes needed.

## Who pays, and how you join

| Merchant | Direct program? | How to actually earn |
| --- | --- | --- |
| **Amazon.in** | ✅ Yes, open & free | Join **Amazon Associates** directly, get a partner tag. |
| **Myntra** | ❌ Not self-serve | Join via an **affiliate network** (Admitad / Cuelinks / EarnKaro / INRDeals). |
| **Flipkart** | ❌ Direct program closed | Via an **affiliate network** (same as above). |
| **Ajio** | ❌ Not self-serve | Via an **affiliate network** (same as above). |

So the practical full setup is **two accounts**:

1. **Amazon Associates** — covers Amazon directly.
2. **One affiliate network** (e.g. Cuelinks or Admitad) — covers Myntra,
   Flipkart, Ajio (and Amazon too, if you prefer one dashboard).

> Programs and commission rates change — always confirm current terms on each
> program's own site before relying on them.

## How a commission happens

1. A shopper taps a product link in Looksy.
2. The link carries **your affiliate ID** (a `?tag=` for Amazon, or a network
   deep-link for the rest).
3. They land on the merchant (app or web) and buy within the **cookie window**
   (Amazon ~24h; networks vary).
4. The merchant/network records the sale against your ID.
5. After a **validation/return window** (≈30–90 days) the commission is
   confirmed and paid out per the network's schedule (subject to a minimum
   payout, and PAN/GST/bank details on file).

## Setup — Amazon (easiest, do this first)

1. Sign up at **https://affiliate-program.amazon.in** (free).
2. Copy your tracking ID / **partner tag**, e.g. `looksy-21`.
3. Add to `.env.local`:
   ```
   AMAZON_PARTNER_TAG=looksy-21
   ```
4. Restart the dev server. Every Amazon link is now stamped with `?tag=` and
   earns commission. (Amazon expects ~3 qualifying sales within 180 days of
   sign-up to keep the account active.)

## Setup — Myntra / Flipkart / Ajio (one network covers all)

Using **Cuelinks** as the example (Admitad / EarnKaro / INRDeals are similar):

1. Sign up at **https://www.cuelinks.com** and add your Looksy site as a
   traffic source (you'll need a live URL — see "Before you apply").
2. Get approved, then find your **CID** and the deep-link format.
3. Add to `.env.local`:
   ```
   LOOKSY_AFFILIATE_TEMPLATE=https://linksredirect.com/?cid=XXXXX&source=looksy&url={url}
   ```
   The literal `{url}` is required — Looksy substitutes each merchant URL into
   it. A network template covers **all four** merchants and takes precedence
   over the Amazon tag.
4. Restart. Every Myntra/Flipkart/Ajio/Amazon link is now wrapped.

## Exact product pages (optional, advanced) — Amazon Creators API

By default the buy link lands on the merchant's **search results** for the
matched item. To link to a **single exact product page** on Amazon, switch the
product provider on:

```
LOOKSY_PRODUCT_PROVIDER=amazon
AMAZON_CREATORS_CLIENT_ID=...
AMAZON_CREATORS_CLIENT_SECRET=...
AMAZON_PARTNER_TAG=looksy-21
```

⚠️ Amazon gates Creators API access behind **~10 qualifying sales in a trailing
30 days**, so a brand-new account can't use it until it drives some sales.
Until then, keep `LOOKSY_PRODUCT_PROVIDER=searchlinks` (or `mock`) — the search
links still monetise via your tag/network.

## Before you apply (what the programs require of your site)

Affiliate programs (especially Amazon) expect a real, working site with:

- A clear **affiliate disclosure** — already shown under every Shop-the-Look
  ("Some links are affiliated…").
- A **Privacy Policy** and basic **About/Contact** page. *(Not built yet — add
  these before applying.)*
- Genuine content/traffic — they review the site at sign-up and periodically.

## Production (when you deploy to Vercel)

Set the same variables in **Vercel → Project → Settings → Environment
Variables** (not just `.env.local`, which is local-only and never committed).
Redeploy after adding them.

## Quick reference

| Variable | Effect |
| --- | --- |
| `AMAZON_PARTNER_TAG` | Stamps `?tag=` on all Amazon links. |
| `LOOKSY_AFFILIATE_TEMPLATE` | Wraps **all** merchant links via your network (needs `{url}`). |
| `LOOKSY_PRODUCT_PROVIDER` | `searchlinks` (default) · `mock` · `amazon` (exact product pages). |
| `AMAZON_CREATORS_CLIENT_ID/SECRET` | Amazon Creators API creds for exact products. |
