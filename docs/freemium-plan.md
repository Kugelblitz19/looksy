# Looksy — Freemium + Payments Plan

*India-first AI fashion app · Next.js 14 (App Router) + Supabase + Vercel · Currency: INR (₹) · Payments: Razorpay*

This is a **plan**, not full code. It assumes the founder is solo, non-expert, on Vercel free tier, and wants the smallest viable paywall shipped first.

---

## 1. Tier design

The single most important product fact: **the free tier already works without any paid AI** (demo/model generation), and the paid tier's marginal cost is small but real (each real-face Gemini image costs money). That combination is the textbook case for **credits, not a subscription** — see reasoning in §3.

| | **Free (Guest + Logged-in)** | **Looksy Pro (Paid)** |
|---|---|---|
| Generation type | Demo / **model** look (not user's face) | **Real-face** look via Gemini (user's selfie) |
| Quota | Guest: 1 free look (current trial). Logged-in: e.g. 3 model looks/day | Pay per **credit** (1 credit = 1 real-face HD look) |
| Resolution | Standard / preview size | **HD, no compression** |
| Watermark | Small "Looksy" watermark in corner | **No watermark** |
| Affiliate shoppable links | Yes (always — this is the always-on revenue layer) | Yes |
| Re-rolls / variations | Limited | Counts as credits (or bundled, see §2) |
| Save / download | Yes (watermarked) | Yes (clean HD) |

**Design principles**
- **Free stays genuinely useful** so the affiliate funnel keeps working for non-payers — affiliate clicks are revenue even from free users, so don't cripple free.
- **The paywall trigger is the moment of highest intent**: user uploads their selfie and asks for *their own* face. That is when you ask for a credit.
- **Watermark + "model, not you"** is the core free-vs-paid wedge — it's visible, emotionally motivating, and cheap to enforce.

---

## 2. Suggested INR pricing

Keep entry price under the "₹100 impulse" threshold for Indian Gen-Z/UPI buyers. Lead with credit packs; offer one cheap "unlimited-ish" monthly only after credits prove demand.

**Credit packs (primary)**

| Pack | Credits | Price (₹) | Per look | Notes |
|---|---|---|---|---|
| Taster | 5 | ₹49 | ₹9.8 | Impulse / first purchase |
| Popular | 20 | ₹149 | ₹7.5 | "Best value" badge — anchor on this |
| Value | 60 | ₹399 | ₹6.7 | Festive / heavy users |

**Optional monthly (introduce later)**

| Plan | Price (₹/mo) | Includes |
|---|---|---|
| Looksy Pro Monthly | ₹199 | e.g. 40 real-face HD looks/month + no watermark + HD on everything |

- 1 credit = 1 real-face HD generation. Re-rolls of the *same* prompt: either free up to N, or 1 credit each — start with "first re-roll free, then 1 credit" to feel fair.
- Price points end in 9 (₹49/₹149/₹399) — standard India psychological pricing.
- All prices are **inclusive of GST to the user**; you account for GST on your side.

---

## 3. Unit economics (why paid covers cost)

**Gemini cost per generation.** Gemini 2.5 Flash Image ("Nano Banana") is **$30 / 1M output tokens**, and each image = **1,290 output tokens ≈ $0.039 / image**. At ~₹86/USD that's **≈ ₹3.4 per image** for the output, plus a small input-token cost for the prompt + selfie (typically a few ₹0.x). **Budget ≈ ₹4 per real-face generation** to be safe (covers input tokens + occasional retries).

**Razorpay cost per sale.** Standard plan: **2% + 18% GST on the fee**, no setup fee, no AMC, charged only on success. Effective ≈ **2.36%** of the transaction. On a ₹149 pack that's ≈ **₹3.5 total**, once per pack (not per look).

**Worked example — the ₹149 / 20-credit "Popular" pack:**

| Line | Amount |
|---|---|
| Revenue | ₹149.00 |
| Razorpay fee (~2.36%) | −₹3.52 |
| Gemini cost (20 looks × ₹4) | −₹80.00 |
| **Gross margin** | **≈ ₹65 (≈ 44%)** |
| Effective gross cost per look | ≈ ₹4.2 |
| Price charged per look | ₹7.5 |

**Why credits over subscription (decision):**
1. **Cost is per-image and variable.** A subscription with heavy users can go cost-negative (a power user generating 500 looks/month at ₹4 = ₹2,000 cost on a ₹199 plan). Credits make revenue track cost 1:1 — you literally cannot lose money on generation.
2. **Indian buyers prefer pay-as-you-go / UPI micro-purchases** over recurring commitments, especially for a young app with no trust history. Recurring mandates (UPI AutoPay/e-mandate) add KYC + setup friction you don't need yet.
3. **Festive spikes** (Diwali/wedding season) fit credits perfectly — people buy a pack for an occasion.
4. **No churn-management burden** for a solo founder — no failed renewals, dunning, or cancellation flows.

Add the monthly plan later only as a convenience SKU for your few heaviest fans — and **cap its included looks** so it can't run negative.

---

## 4. Razorpay integration — what to build

Architecture: Razorpay Checkout on the client, two server routes (create-order, webhook), Supabase as source of truth for credits. **Credits are granted by the webhook, never by the browser.**

### 4.1 Supabase tables (entitlements)

```
profiles (existing)            -- user_id (FK auth.users)
  credits          int default 0          -- current real-face credit balance

payment_orders                 -- one row per Razorpay order you create
  id               uuid pk
  user_id          uuid  fk auth.users
  razorpay_order_id text unique
  amount_paise     int
  credits          int                    -- credits this pack grants
  status           text  -- created | paid | failed
  created_at       timestamptz

credit_ledger                  -- append-only audit (every +/- to balance)
  id               uuid pk
  user_id          uuid
  delta            int          -- +20 on purchase, -1 on generation
  reason           text         -- 'purchase' | 'generation' | 'refund'
  ref              text         -- razorpay_payment_id or generation_id
  created_at       timestamptz
```

- Enable **RLS**: users can `select` their own `credits`/`ledger`, but **only the service role** (used in webhook + generation API) may `update` credits. The browser must never write credits.
- Decrement a credit **server-side inside the real-face generation route**, atomically (e.g. a Postgres function `spend_credit(user_id)` that checks balance, decrements, and inserts a ledger row in one transaction). Reject generation if balance = 0.
- Make webhook credit-granting **idempotent**: unique constraint on `razorpay_payment_id` in the ledger (or check `payment_orders.status` before granting) so Razorpay's retry/duplicate webhooks can't double-credit.

### 4.2 API routes (Next.js App Router, server-only)

**a) `POST /api/payments/create-order`** (authenticated)
- Input: `packId` (server maps packId → amount + credits; **never trust amount from the client**).
- Calls `razorpay.orders.create({ amount: paise, currency: 'INR', receipt })`.
- Inserts a `payment_orders` row (`status='created'`, with the credits that pack grants).
- Returns `{ orderId, amount, currency, key: RAZORPAY_KEY_ID }` to the client.

**b) Client Checkout** (in a `'use client'` component)
- Load `https://checkout.razorpay.com/v1/checkout.js`.
- Open Razorpay with the `orderId` from (a), prefill user email/contact, set theme.
- On success Razorpay returns `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`. **Treat this as cosmetic only** ("Payment received, crediting your account…") — do not grant credits here.

**c) `POST /api/payments/webhook`** (public, no auth — this is the source of truth)
- Verify the signature: `HMAC_SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET)` compared to the `x-razorpay-signature` header. **Critical:** read the **raw request body** for the HMAC. In App Router, use `await req.text()` and verify before `JSON.parse`.
- On event `payment.captured` (and/or `order.paid`): look up `payment_orders` by `razorpay_order_id`, check it isn't already `paid` (idempotency), set `status='paid'`, `+credits` to `profiles.credits`, insert a `credit_ledger` row.
- Return `200` quickly; do all work idempotently so Razorpay retries are safe.

> Optionally also keep a `verify` step on the success callback for instant UX, but the **webhook is authoritative** — webhooks fire even if the user closes the tab right after paying.

### 4.3 Env vars (Vercel project settings)

| Var | Where used | Notes |
|---|---|---|
| `RAZORPAY_KEY_ID` | server + sent to client | public-ish; identifies your account |
| `RAZORPAY_KEY_SECRET` | server only | **never expose to client** |
| `RAZORPAY_WEBHOOK_SECRET` | webhook route only | the secret you set in dashboard when creating the webhook (separate from key secret) |
| `SUPABASE_SERVICE_ROLE_KEY` | webhook + generation routes only | server-only; bypasses RLS to write credits |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | client checkout | mirror of key id for the browser |
| *(existing)* `GEMINI_API_KEY`, affiliate vars | unchanged | |

Use **test keys** (`rzp_test_...`) until KYC is live; swap to **live keys** (`rzp_live_...`) after activation. Keep test/live webhook secrets separate.

### 4.4 What the founder sets up in the Razorpay dashboard

1. **Sign up** at razorpay.com → you immediately get **Test Mode** keys and can build/integrate fully without KYC.
2. **Complete KYC / Account Activation** to accept real money (live mode). For a **solo founder / proprietorship**, prepare:
   - **PAN** of the proprietor (acts as business PAN)
   - **Government ID** of authorised signatory (Aadhaar / Passport / Voter ID)
   - **Business registration proof** — Shop & Establishment certificate **or Udyam (MSME) registration** (Udyam is the easiest for a solo founder to obtain online)
   - **Bank account / cancelled cheque** — name must match PAN exactly (this is where settlements land)
   - **Business address proof**
   - Files: PDF/JPG/PNG, each < 5 MB, clear/unblurred. Activation typically takes **1–3 business days**.
3. **Set the business category** accurately (e.g. software/internet services). Avoid mis-categorising — it can stall activation.
4. **Create the webhook**: Dashboard → Settings → Webhooks → add `https://looksy-lemon.vercel.app/api/payments/webhook`, set a **webhook secret** (this becomes `RAZORPAY_WEBHOOK_SECRET`), and subscribe to **`payment.captured`** (and optionally `order.paid`, `payment.failed`). Razorpay requires **HTTPS** — Vercel gives you that automatically.
5. **Enable payment methods** you want (UPI is a must for India; cards, netbanking, wallets optional).
6. **Settlement**: confirm settlement bank account; default cycle is ~T+2 working days to your bank.
7. Note pricing: **standard 2% + 18% GST, no setup fee, no AMC**, charged only on successful payments. Negotiate later if volume grows.

---

## 5. Phased build checklist (smallest viable paywall first)

**Phase 0 — Decide & set up (no code risk)**
- [ ] Lock tier rules: free = model + watermark; paid = real-face + HD + no watermark.
- [ ] Lock launch SKU: **one pack only** to start (₹149 / 20 credits) — fewer choices ships faster.
- [ ] Create Razorpay account, grab **test keys**, start KYC paperwork in parallel.

**Phase 1 — Entitlements backbone (no payments yet)**
- [ ] Add `profiles.credits`, `payment_orders`, `credit_ledger` tables + RLS.
- [ ] Add `spend_credit()` Postgres function; wire the **real-face generation route to require + decrement a credit** server-side (gate the feature *before* money — verify the gate works by manually setting credits in DB).

**Phase 2 — Minimum viable paywall (test mode)**
- [ ] `POST /api/payments/create-order` (server maps pack → amount/credits).
- [ ] Client Razorpay Checkout button on a "Buy credits" sheet, triggered when a free user requests real-face.
- [ ] `POST /api/payments/webhook` with **signature verification + idempotent credit grant**.
- [ ] End-to-end test with `rzp_test_` keys + Razorpay test cards/UPI; confirm credits land via webhook even if you close the tab.

**Phase 3 — Go live**
- [ ] KYC approved → switch to **live keys**, create **live-mode webhook + secret**, update Vercel env.
- [ ] Add "Payments" disclosure pages: simple **Terms, Refund/Cancellation, Pricing, Contact** (Razorpay activation and customer trust both expect these). *(Terms + Refund pages already exist in the app.)*
- [ ] Soft-launch to a small group; watch the `credit_ledger` and Razorpay dashboard for mismatches.

**Phase 4 — Expand (after revenue is real)**
- [ ] Add the other packs (₹49 / ₹399) and the "Best value" anchor.
- [ ] Add a **balance display** + low-credit nudge in the UI.
- [ ] Only then consider **₹199/mo capped subscription** via UPI AutoPay/e-mandate.
- [ ] Track funnel: free → first real-face attempt → buy → repeat-buy; tune watermark/quota to maximise conversion without killing affiliate clicks.

**Guardrails throughout**
- Never trust client-sent amounts or grant credits from the browser.
- Webhook is the source of truth; everything idempotent.
- `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` stay server-only.
- Cap any future "unlimited" plan so generation cost can't exceed revenue.
