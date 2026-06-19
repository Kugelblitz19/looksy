# StyleGlance

A Glance-AI-style web app: upload a selfie, pick a vibe (streetwear, party, old
money, workout, techwear…) or describe a look, and get photorealistic AI images
of **you** wearing it.

Built with **Next.js (App Router) + Tailwind**, with image generation powered by
**Google Gemini 2.5 Flash Image ("Nano Banana")**. The Gemini call runs in a
server-side API route so your key never reaches the browser — and so the native
iOS/Android apps can reuse the same `/api/generate` endpoint later.

## Quick start

```bash
npm install
cp .env.local.example .env.local   # then paste your key into .env.local
npm run dev
```

Open http://localhost:3000.

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

## Roadmap toward native apps

The backend is a plain HTTP JSON/multipart endpoint, so the planned React
Native / native iOS + Android clients can call the same `/api/generate` route.
Likely next steps: hosted image storage instead of inline data URLs, user
accounts + saved looks, and a shoppable product-tagging layer.
