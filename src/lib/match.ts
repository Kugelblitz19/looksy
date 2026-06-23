import type { DetectedGarment, Product } from "./garments";

/**
 * How closely a real product matches the garment we detected on the cover.
 *
 * This is a transparent, explainable heuristic — NOT a black-box ML score. We
 * weight the garment's own attributes (its head noun, colour, fabric, cut and
 * pattern) and measure how much of that weight the product's title covers, with
 * a penalty when the product is clearly a different colour. The richer the
 * detection (Gemini vision in real-face mode), the sharper the score; with a
 * real product feed it ranks the genuinely closest item to the top.
 */

const STOP = new Set([
  "the", "a", "an", "with", "and", "for", "in", "of", "to",
  "men", "mens", "women", "womens", "unisex", "boys", "girls",
]);

const COLORS = new Set([
  "black", "white", "grey", "gray", "beige", "navy", "blue", "red", "green",
  "olive", "brown", "tan", "cream", "ivory", "pink", "maroon", "burgundy",
  "gold", "silver", "khaki", "charcoal", "mustard", "rust", "teal", "lilac",
  "lavender", "peach", "coral", "mint", "wine",
]);

function tokens(s?: string): string[] {
  if (!s) return [];
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

/** Weighted bag of the terms that define this garment. */
function garmentTerms(g: DetectedGarment): Map<string, number> {
  const terms = new Map<string, number>();
  const bump = (t: string, w: number) =>
    terms.set(t, Math.max(terms.get(t) ?? 0, w));

  const name = tokens(g.name);
  name.forEach((t, i) => bump(t, i === name.length - 1 ? 3 : 1.5)); // head noun dominates
  tokens(g.color).forEach((t) => bump(t, 2));
  tokens(g.material).forEach((t) => bump(t, 1.5));
  tokens(g.pattern).forEach((t) => bump(t, 1));
  tokens(g.fit).forEach((t) => bump(t, 1));
  tokens(g.searchQuery).forEach((t) => bump(t, 1)); // fills in anything missed

  return terms;
}

export interface MatchResult {
  /** 0–100 closeness of this product to the detected garment. */
  score: number;
  /** Which garment attributes the product title covered. */
  matched: string[];
}

export function scoreMatch(g: DetectedGarment, product: Product): MatchResult {
  const terms = garmentTerms(g);
  const titleTokens = new Set(tokens(product.title));

  let total = 0;
  let got = 0;
  const matched: string[] = [];
  for (const [term, weight] of terms) {
    total += weight;
    if (titleTokens.has(term)) {
      got += weight;
      matched.push(term);
    }
  }

  const coverage = total > 0 ? got / total : 0;
  let score = Math.round(58 + coverage * 40); // 58 (nothing) → 98 (everything)

  // Penalise an unmistakably different colour.
  const garmentColors = tokens(g.color).filter((t) => COLORS.has(t));
  const titleColors = [...titleTokens].filter((t) => COLORS.has(t));
  if (
    garmentColors.length &&
    titleColors.length &&
    !titleColors.some((c) => garmentColors.includes(c))
  ) {
    score -= 12;
  }

  return { score: Math.max(52, Math.min(99, score)), matched };
}

/**
 * Attach a match score to every product and return them ranked closest-first
 * (ties broken by lower price), so the most exact item surfaces at the top.
 */
export function rankByMatch(g: DetectedGarment, products: Product[]): Product[] {
  return products
    .map((p) => {
      const { score, matched } = scoreMatch(g, p);
      return { ...p, match: score, matched };
    })
    .sort(
      (a, b) =>
        (b.match ?? 0) - (a.match ?? 0) ||
        (a.price ?? Infinity) - (b.price ?? Infinity),
    );
}

/** Best (closest) product match for a garment, or undefined if it has none. */
export function bestMatch(products: Product[]): number | undefined {
  const scored = products
    .map((p) => p.match)
    .filter((m): m is number => typeof m === "number");
  return scored.length ? Math.max(...scored) : undefined;
}

/** Overall "look match": the average of each garment's best match. */
export function lookMatch(matches: number[]): number | undefined {
  if (!matches.length) return undefined;
  return Math.round(matches.reduce((s, m) => s + m, 0) / matches.length);
}
