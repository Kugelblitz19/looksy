import type { Aesthetic } from "./types";

/**
 * The taste / vibe presets a user can pick from. Each one carries a rich
 * `prompt` descriptor that gets woven into the final generation prompt so the
 * model dresses the person in a coherent, recognizable style.
 */
export const AESTHETICS: Aesthetic[] = [
  {
    id: "streetwear",
    label: "Streetwear",
    emoji: "🧢",
    blurb: "Urban, oversized, sneaker-forward",
    prompt:
      "trendy urban streetwear — an oversized hoodie or graphic tee, baggy cargo or loose denim, fresh chunky sneakers, a beanie or cap and layered chains; set against a gritty city street with graffiti and soft overcast light",
  },
  {
    id: "party",
    label: "Party Wear",
    emoji: "🪩",
    blurb: "Night-out, bold, glam",
    prompt:
      "stylish night-out party wear — a sleek, fashion-forward going-out outfit with a bold silhouette and statement accessories; set in an upscale lounge or club with dramatic neon and bokeh lighting",
  },
  {
    id: "workout",
    label: "Running / Workout",
    emoji: "🏃",
    blurb: "Athletic, performance, active",
    prompt:
      "athletic running and workout wear — fitted performance activewear in moisture-wicking fabric, supportive running shoes, a smartwatch; captured mid-motion on an outdoor track or modern gym with energetic morning light",
  },
  {
    id: "oldmoney",
    label: "Old Money",
    emoji: "🥂",
    blurb: "Quiet luxury, tailored, refined",
    prompt:
      "old-money quiet-luxury aesthetic — tailored neutral-tone classics, cashmere knit or a crisp blazer, well-pressed trousers, leather loafers and understated gold details; set at a country club, yacht or grand estate with warm afternoon light",
  },
  {
    id: "minimal",
    label: "Clean / Minimal",
    emoji: "🤍",
    blurb: "Neutral palette, effortless basics",
    prompt:
      "clean minimal aesthetic — a neutral monochrome palette of perfectly-fitted basics, effortless and polished tailoring; set in a bright minimalist studio with soft diffused natural light",
  },
  {
    id: "business",
    label: "Business / Formal",
    emoji: "👔",
    blurb: "Sharp, polished, professional",
    prompt:
      "sharp formal business wear — a precisely tailored suit or an elegant power dress, polished shoes and a refined watch; set in a sleek modern office or upscale hotel lobby with clean directional light",
  },
  {
    id: "y2k",
    label: "Y2K",
    emoji: "💿",
    blurb: "Early-2000s throwback, playful",
    prompt:
      "Y2K early-2000s throwback fashion — low-rise denim, baby tees, tinted sunglasses, butterfly clips and metallic accents in a playful retro palette; set against a vibrant pop-art backdrop",
  },
  {
    id: "festive",
    label: "Festive / Ethnic",
    emoji: "✨",
    blurb: "Traditional, ornate, celebratory",
    prompt:
      "festive traditional ethnic wear — an elegant ornate outfit in rich jewel-toned fabrics with intricate embroidery and tasteful jewelry; set in a warmly-lit celebration with marigold and fairy-light decor",
  },
  {
    id: "casual",
    label: "Everyday Casual",
    emoji: "👕",
    blurb: "Relaxed, comfortable, daytime",
    prompt:
      "relaxed everyday casual wear — comfortable, well-styled basics like a soft tee, well-fitted jeans and clean white sneakers; set in a sunlit café or leafy neighborhood street at golden hour",
  },
  {
    id: "techwear",
    label: "Techwear",
    emoji: "🩶",
    blurb: "Functional, all-black, futuristic",
    prompt:
      "futuristic techwear — an all-black functional outfit with tactical straps, weatherproof shells, cargo joggers and chunky boots; set against a rain-slicked neon cyberpunk alley at night",
  },
];

const BY_ID = new Map(AESTHETICS.map((a) => [a.id, a]));

export function getAesthetic(id: string): Aesthetic | undefined {
  return BY_ID.get(id);
}
