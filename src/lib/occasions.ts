/**
 * Occasion packs — purpose-driven shortcuts that pre-fill the chosen aesthetics
 * and a starter prompt. India shopping is overwhelmingly occasion-driven, so
 * these are the highest-intent entry points into the create flow.
 */
export interface Occasion {
  id: string;
  label: string;
  emoji: string;
  aesthetics: string[];
  prompt: string;
}

export const OCCASIONS: Occasion[] = [
  { id: "mehendi", label: "Mehendi Night", emoji: "🌿", aesthetics: ["festive"], prompt: "mustard-and-leaf-green mehendi look, lightweight cotton kurta, mirror-work dupatta, fresh-mehendi hands under string lights in a courtyard" },
  { id: "sangeet", label: "Sangeet", emoji: "🎶", aesthetics: ["festive", "party"], prompt: "high-energy sangeet outfit built to dance in, a sequinned lehenga or a sharp bandhgala, jhumkas catching the stage lights" },
  { id: "reception", label: "Reception", emoji: "🥂", aesthetics: ["festive", "business"], prompt: "black-tie Indian reception look, a structured floor-length gown or an ivory sherwani, polished and camera-ready under chandeliers" },
  { id: "diwali-lunch", label: "Diwali Lunch", emoji: "🪔", aesthetics: ["festive", "casual"], prompt: "daytime Diwali lunch look, an easy silk kurta in marigold or pomegranate, gold studs, diyas and rangoli in soft afternoon light" },
  { id: "office-friday", label: "Office Friday", emoji: "💼", aesthetics: ["business", "casual"], prompt: "smart-casual Friday-at-the-office look, a crisp linen shirt with tailored trousers, loafers, relaxed but still boardroom-clean" },
  { id: "weekend-market", label: "Weekend Market", emoji: "🛍️", aesthetics: ["casual", "streetwear"], prompt: "Sunday flea-market look, an oversized tee, baggy denim, a tote and chunky sneakers, candid amid stalls and chai vendors" },
  { id: "chai-date", label: "Chai Date", emoji: "☕", aesthetics: ["casual", "minimal"], prompt: "low-key chai-date look, a soft neutral knit and straight trousers, minimal jewellery, warm window light in a quiet café" },
  { id: "night-out", label: "Night Out", emoji: "🪩", aesthetics: ["party"], prompt: "after-dark night-out look, a slip dress or a sharp monochrome co-ord, statement heels, rooftop-bar neon" },
  { id: "brunch", label: "Brunch", emoji: "🥐", aesthetics: ["casual", "minimal"], prompt: "breezy weekend-brunch look, a pressed cotton shirt-dress in ivory, woven flats, sun-drenched courtyard tables" },
];

/** Short, tappable phrases that get appended to the prompt to refine a look. */
export const PROMPT_IDEAS: string[] = [
  "in golden-hour light",
  "shot on a Mumbai terrace",
  "all-ivory palette",
  "with heritage jewellery",
  "candid street-style",
  "monsoon-ready layers",
  "draped in handloom",
  "against a whitewashed wall",
  "marigold-and-ink palette",
  "framed like a magazine cover",
];
