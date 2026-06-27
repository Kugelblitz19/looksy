# Activate Looksy affiliate earnings

A step-by-step setup guide. Do this once and every garment link in Looksy starts earning. ~30 min of clicking, plus a 1-2 day approval wait. No code changes needed — you only paste two values into Vercel.

---

## Part 1 — Cuelinks (covers Myntra, Ajio, Flipkart, Nykaa + 1,500 more)

Cuelinks is one signup that unlocks almost every Indian fashion store. You get a single redirect link format and Cuelinks figures out the store and applies the right affiliate program automatically. This is the big one for Looksy.

**Step 1 — Sign up**
1. Go to **https://www.cuelinks.com** and click **Join Now** (top right).
2. Register with your email (use `curious.labs@pw.live` or a brand email). Add your website **https://looksy-lemon.vercel.app** as your "channel/property."
3. Submit. Approval usually takes **24-48 hours** (Cuelinks manually reviews). Wait for the email subject **"Cuelinks - Your account has been approved."**
4. Add your bank/UPI + PAN under **Profile → Payment Details** so you can actually get paid later (Cuelinks pays out monthly once you cross the minimum threshold).

**Step 2 — Find your `cid`**
1. Log in to the Cuelinks dashboard → go to **Tools → Link Generator** (sometimes called "Quick Link").
2. Paste any product URL (e.g. a Myntra product page) and click **Generate Link**.
3. You'll get back a link that looks exactly like this:
   ```
   https://linksredirect.com/?cid=167541&source=linkkit&url=https://www.myntra.com/...
   ```
4. The number after `cid=` is **your unique Cuelinks ID**. In this example it's `167541` — **yours will be different.** Copy your own number.

> Sanity check: paste your generated `linksredirect.com` link in a browser. It should land on the store with `?tag=cuelinks...-21` in the final URL. If you see that, tracking works.

**Step 3 — Your exact `LOOKSY_AFFILIATE_TEMPLATE` value**

Take your `cid` and build the template. Looksy's helper swaps `{url}` for each garment's store link, so keep `{url}` literal at the end and `source=looksy` for clean reporting:

```
https://linksredirect.com/?cid=YOUR_CID&source=looksy&url={url}
```

Concrete example (if your cid were `167541`):
```
https://linksredirect.com/?cid=167541&source=looksy&url={url}
```

Replace `YOUR_CID` with your real number. **Keep `{url}` exactly as-is — do not remove the curly braces, do not URL-encode it.** That is the entire value you paste into Vercel in Part 3.

---

## Part 2 — Amazon Associates India (separate, optional, for Amazon links)

Cuelinks does cover Amazon too, but a **direct** Amazon Associates account usually pays a bit more on Amazon and is worth having. Looksy already supports it via a separate `AMAZON_PARTNER_TAG` variable, applied only to amazon.in links.

**Step 1 — Sign up**
1. Go to **https://affiliate.amazon.in** and click **Sign up**. Log in with your normal Amazon.in account (or create one).
2. Fill in your details and add **https://looksy-lemon.vercel.app** as your website/app.
3. In "Profile," it asks how you drive traffic, what you'll promote (pick **Apparel / Fashion**), etc. Fill honestly.
4. Submit. You get **instant access** to a tracking ID and can start making links immediately.

**Step 2 — Get your partner tag**
- During signup Amazon assigns you a **Store ID / Tracking ID**. For Amazon India it always **ends in `-21`** (e.g. `looksy0c-21`, `curiouslabs-21`).
- Find it in the Associates dashboard top bar, or under **Account Settings → Manage Your Tracking IDs**.

**Step 3 — Your exact `AMAZON_PARTNER_TAG` value**

It's just the tag by itself, including the `-21`. **No URL, no `tag=`, no quotes:**
```
yourtag-21
```
Example: `looksy0c-21`

**Step 4 — The 3-sales-in-180-days caveat (important, read this)**
- Amazon gives you the tag right away, but your account is **provisional**. You must drive **3 qualifying sales within 180 days** of signup or Amazon **closes the account** and you have to reapply.
- A "qualifying sale" = someone clicks a Looksy Amazon link and **buys** within the 24-hour cookie window. **Your own purchases do NOT count.**
- **Practical advice:** because Looksy is new and low-traffic, don't lean on Amazon yet. Set up **Cuelinks first (no such deadline)**, and only add `AMAZON_PARTNER_TAG` once you have real visitors who'll generate those 3 sales — otherwise you'll just burn the 180-day clock and have to redo it. You can leave the Amazon variable unset for now; Looksy will fall back to Cuelinks for Amazon links.

---

## Part 3 — Paste into Vercel and redeploy

1. Go to **https://vercel.com** → open your **looksy** project.
2. Top nav: **Settings** → left sidebar: **Environment Variables**.
3. Add the first variable:
   - **Key:** `LOOKSY_AFFILIATE_TEMPLATE`
   - **Value:** your Part 1 template, e.g. `https://linksredirect.com/?cid=167541&source=looksy&url={url}`
   - **Environments:** tick **Production** (and Preview/Development if you want it everywhere).
   - Click **Save**.
4. (Optional, only when ready) Add the second variable:
   - **Key:** `AMAZON_PARTNER_TAG`
   - **Value:** `yourtag-21`
   - Tick **Production** → **Save**.
5. **Redeploy so the new variables take effect.** Env-var changes do **not** apply to the live site until you redeploy:
   - Go to the **Deployments** tab → click the **⋯** menu on the latest deployment → **Redeploy** → confirm.
   - (Or just push any commit to your main branch — that also triggers a fresh deploy with the new vars.)
6. After it goes live, open Looksy, generate a look, click a garment, and confirm the URL passes through `linksredirect.com` (and Amazon links carry `tag=yourtag-21`). If yes — you're earning.

---

## Honest expectations

- **Commissions are small per sale.** Indian fashion affiliate rates are roughly **3-9%** of order value (Myntra/Ajio/Nykaa apparel typically land in this band; Amazon India fashion is about **4-9%**, occasionally up to ~12% on men's apparel). On a ₹1,500 dress at 6%, that's about **₹90** — and only **if the click converts to a purchase**.
- **Most clicks don't buy.** EPC (earnings per 100 clicks) for fashion is modest; a realistic mental model is that you might see a few rupees per click *on average*, heavily dependent on how shoppable and trustworthy your looks feel. Festive seasons (Diwali, wedding season, end-of-season sales) convert noticeably better.
- **Cookie windows are short.** Amazon India is a **24-hour** window; most Cuelinks stores are similar or shorter. The buyer has to purchase soon after clicking, not weeks later.
- **Earnings scale almost linearly with traffic.** With zero changes to your code, 10x the visitors ≈ 10x the income. The lever is not the commission rate — it's **how many engaged people see and click your looks.** This is why driving Looksy traffic (Instagram OOTD posts, Reels, SEO) matters far more than tweaking affiliate settings.
- **Payouts are delayed and have minimums.** Both networks confirm sales after a return/validation period and pay out monthly only above a threshold. Treat the first few months as proving the funnel works, not as income.

**Bottom line:** Do **Cuelinks now** (covers most of your stores, no deadline pressure). Add **Amazon later** once you have steady traffic that can clear the 3-sales-in-180-days bar. Then pour energy into traffic — that's the real multiplier.
