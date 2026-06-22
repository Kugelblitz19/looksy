// One-off: generate real example fashion looks via Pollinations (free, no key)
// and save them to public/examples/. Run: node scripts/gen-examples.mjs
import { writeFile, mkdir } from "node:fs/promises";

const OUT = new URL("../public/examples/", import.meta.url);

const LOOKS = [
  { id: "streetwear", seed: 4021, subject: "a stylish young woman",
    p: "trendy urban streetwear, oversized hoodie, baggy cargo pants, fresh chunky sneakers, cap and layered chains, gritty city street with graffiti, soft overcast light" },
  { id: "oldmoney", seed: 7314, subject: "a refined man",
    p: "old-money quiet-luxury, tailored neutral cashmere knit over a crisp shirt, pressed trousers, leather loafers, understated gold watch, grand estate terrace, warm afternoon light" },
  { id: "party", seed: 9582, subject: "a glamorous woman",
    p: "chic night-out party wear, sleek statement going-out outfit, bold silhouette, upscale lounge with neon and bokeh lighting" },
  { id: "festive", seed: 2236, subject: "an elegant Indian woman",
    p: "festive traditional ethnic wear, ornate jewel-toned fabric with intricate embroidery and tasteful jewelry, warmly lit celebration with marigold and fairy-light decor" },
  { id: "techwear", seed: 6190, subject: "a man",
    p: "futuristic techwear, all-black functional outfit with tactical straps, weatherproof shell, cargo joggers, chunky boots, rain-slicked neon cyberpunk alley at night" },
  { id: "casual", seed: 5128, subject: "a young woman",
    p: "relaxed everyday casual wear, soft tee, well-fitted jeans, clean white sneakers, sunlit leafy street at golden hour" },
];

function url(look) {
  const prompt = `full-body editorial fashion lookbook photograph of ${look.subject}, ${look.p}, standing full figure head to toe, professional fashion photography, sharp focus, photorealistic, ultra detailed`;
  const q = new URLSearchParams({ width: "768", height: "1024", model: "flux", nologo: "true", seed: String(look.seed) });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${q}`;
}

async function fetchOne(look, attempt = 1) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 90000);
  try {
    const res = await fetch(url(look), { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 5000) throw new Error(`tiny (${buf.length}b)`);
    await writeFile(new URL(`${look.id}.jpg`, OUT), buf);
    console.log(`✓ ${look.id} (${Math.round(buf.length / 1024)}kb)`);
  } catch (e) {
    if (attempt < 3) {
      console.log(`… retry ${look.id} (${e.message})`);
      await new Promise((r) => setTimeout(r, 4000));
      return fetchOne(look, attempt + 1);
    }
    console.log(`✗ ${look.id} FAILED: ${e.message}`);
  } finally {
    clearTimeout(t);
  }
}

await mkdir(OUT, { recursive: true });
for (const look of LOOKS) {
  await fetchOne(look);
  await new Promise((r) => setTimeout(r, 1500)); // be gentle on the free tier
}
console.log("done");
