# Looksy

**Looksy — see yourself in any look.** Upload a selfie, pick a vibe (streetwear,
party, old money, workout, techwear…) or describe an outfit, and get
photorealistic AI images of **you** wearing it.

Built with **Next.js (App Router) + Tailwind**, with image generation powered by
**Google Gemini 2.5 Flash Image ("Nano Banana")**. The Gemini call runs in a
server-side API route so your key never reaches the browser — and so the planned
native iOS/Android apps can reuse the same `/api/generate` endpoint later.

> Inspired by the Glance AI selfie-to-styled-feed experience.

## Quick start

```bash
git clone https://github.com/Kugelblitz19/looksy.git
cd looksy
npm install
cp .env.local.example .env.local   # then paste your Gemini key into .env.local
npm run dev
```

Open http://localhost:3000. You'll land on a **login / signup** screen — create
an account and you're taken to the studio.

## Accounts (login / signup)

Auth is built on **Supabase**. The home page (`/`) redirects to `/login` until
you're signed in; the image/shop APIs require a session.

> **Graceful fallback:** until you set Supabase keys, the app falls back to a
> temporary built-in email/password store (`src/lib/auth/*`, JSON file in
> `data/`) so it keeps working. Once the keys below are set, the app
> automatically switches to Supabase (Email + Phone + Google) — no code change.

### Setting up Supabase auth

1. **Keys** — create a project at supabase.com, run [`supabase/schema.sql`](supabase/schema.sql)
   in the SQL Editor, then put these in `.env.local` (from Project Settings → API):
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...      # server-only, never exposed
   ```
2. **URL config** (Authentication → URL Configuration): set Site URL and add
   Redirect URLs `http://localhost:3000/**` and your production domain.
3. **Email** — Authentication → Providers → Email is on by default. For quick
   testing, turn **Confirm email OFF** so signup logs you in immediately; turn it
   back ON for production.
4. **Google** — create an OAuth client in Google Cloud Console (APIs & Services →
   Credentials → Web application):
   - *Authorized JavaScript origins*: `http://localhost:3000` + your domain.
   - *Authorized redirect URI*: your **Supabase** callback
     `https://<project-ref>.supabase.co/auth/v1/callback` (not the app URL!).
   - Paste the Client ID + Secret into Supabase → Providers → Google.
   - The app redirects back to `/auth/callback` (already built).
5. **Phone (SMS OTP)** — Authentication → Providers → Phone: enable it and connect
   an SMS gateway (e.g. **Twilio**: Account SID + Auth Token + Messaging Service
   SID). ⚠️ **SMS is billed per message by the gateway — not free.** Use E.164
   numbers (`+919876543210`). Consider enabling CAPTCHA + lowering OTP rate limits
   to avoid SMS-pumping abuse.

Implementation lives in `src/lib/supabase/*` (clients + middleware),
`src/components/SupabaseAuthForm.tsx`, and `src/app/auth/callback/route.ts`.

### Demo mode (no key needed)

Without `GEMINI_API_KEY` set, the app runs in **demo mode** and returns labeled
placeholder images so you can click through the full flow. Add a key to switch
on real generation — no code changes needed.

## Getting a Gemini API key

1. Go to https://aistudio.google.com/apikey and create a key.
2. Put it in `.env.local`:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. Restart `npm run dev`.

If Google renames the image model, override it without touching code:

```
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

## How it works

1. **`src/app/page.tsx`** — the studio UI: photo upload, vibe chips, prompt box.
2. **`POST /api/generate`** (`src/app/api/generate/route.ts`) — receives the
   photos + chosen vibes + prompt.
3. **`src/lib/stylist.ts`** — assembles a detailed, identity-preserving prompt
   from the chosen aesthetics (`src/lib/aesthetics.ts`) and the user's text.
4. **`src/lib/gemini.ts`** — sends the prompt + reference photos to Gemini and
   returns the generated image(s).

## Shop the Look (monetization)

Every generated look is shoppable. Click **🛍 Shop this look** on a card and:

1. **`POST /api/shop`** (`src/app/api/shop/route.ts`) reads the look.
2. **`src/lib/detect.ts`** uses Gemini vision to extract each garment as a
   structured search query (e.g. "men beige cargo pants"). In demo mode it
   derives items from the chosen vibe instead.
3. A **product provider** (`src/lib/products.ts`) returns buyable items:
   - `searchlinks` (default) — merchant search-link chips, no API.
   - `mock` — fake demo product cards to preview the v2 UI.
   - `amazon` — real products (title, price, image, buy URL) via the Amazon
     Creators API (`src/lib/providers/amazon.ts`).
4. **`src/lib/affiliate.ts`** wraps every link so purchases earn you commission.

Set the provider with `LOOKSY_PRODUCT_PROVIDER` (see `.env.local.example`).

> Note: AI-generated garments are synthetic, so links go to *visually similar*
> real products ("shop similar") — the standard approach for shoppable-AI apps.
>
> The Amazon provider is built to the Creators API spec with defensive response
> parsing, but its exact field shapes should be confirmed against a live
> response once you have approved credentials (Creators API replaces PA-API,
> which retires ~May 15 2026). Until then it fails safe to the search links.

### Turning on commissions

Sign up with an affiliate network that covers Indian fashion merchants
(Cuelinks, EarnKaro, INRDeals, Admitad…), then paste its deep-link template —
with a literal `{url}` placeholder — into `.env.local`:

```
LOOKSY_AFFILIATE_TEMPLATE=https://linksredirect.com/?cid=XXXXX&source=looksy&url={url}
```

With no template set, links still work — they're just not monetized yet.

## Roadmap toward native apps

The backend is a plain HTTP JSON/multipart endpoint, so the planned React
Native / native iOS + Android clients can call the same `/api/generate` route.
Likely next steps: hosted image storage instead of inline data URLs, user
accounts + saved looks, and a shoppable product-tagging layer.
