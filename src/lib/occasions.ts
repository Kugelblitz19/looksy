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
  { id: "wedding", label: "Wedding Guest", emoji: "💍", aesthetics: ["festive"], prompt: "elegant wedding-guest outfit at a grand celebration" },
  { id: "diwali", label: "Diwali", emoji: "🪔", aesthetics: ["festive"], prompt: "festive Diwali outfit with warm fairy lights and marigolds" },
  { id: "office", label: "Office", emoji: "💼", aesthetics: ["business"], prompt: "smart, polished office workday outfit" },
  { id: "date", label: "Date Night", emoji: "🌃", aesthetics: ["party"], prompt: "stylish date-night outfit for an evening out" },
  { id: "interview", label: "Interview", emoji: "🤝", aesthetics: ["business", "minimal"], prompt: "sharp, confident job-interview outfit" },
  { id: "brunch", label: "Brunch", emoji: "🥐", aesthetics: ["casual", "minimal"], prompt: "relaxed weekend brunch outfit in sunny daytime light" },
  { id: "vacation", label: "Vacation", emoji: "🏖️", aesthetics: ["casual"], prompt: "breezy vacation outfit with holiday vibes" },
  { id: "nightout", label: "Night Out", emoji: "🪩", aesthetics: ["party"], prompt: "bold night-out party outfit at a club" },
  { id: "gym", label: "Gym", emoji: "🏋️", aesthetics: ["workout"], prompt: "performance gym and workout outfit" },
];

/** Short, tappable phrases that get appended to the prompt to refine a look. */
export const PROMPT_IDEAS: string[] = [
  "in soft golden-hour light",
  "on a city street",
  "neutral beige palette",
  "all-black outfit",
  "with statement accessories",
  "clean & minimal",
  "pastel colour palette",
  "street-style candid",
  "studio backdrop",
  "monsoon-ready layers",
];
