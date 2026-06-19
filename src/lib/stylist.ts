import { getAesthetic } from "./aesthetics";

/**
 * Slightly varies framing/angle between variations so a single request returns
 * a diverse set of looks rather than near-duplicates.
 */
const VARIATIONS = [
  "full-body fashion shot, straight-on, eye-level",
  "three-quarter angle, slightly low camera, dynamic pose",
  "waist-up portrait crop, candid expression",
  "full-body, side profile turning toward camera",
];

interface BuildPromptOpts {
  aestheticIds: string[];
  userPrompt: string;
  hasPhotos: boolean;
  variation?: number;
}

/**
 * Assembles the final text prompt sent to the image model. When the user
 * provides photos we strongly instruct the model to preserve their identity so
 * the result actually looks like *them* wearing the new outfit.
 */
export function buildPrompt({
  aestheticIds,
  userPrompt,
  hasPhotos,
  variation = 0,
}: BuildPromptOpts): string {
  const styleDescriptors = aestheticIds
    .map(getAesthetic)
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .map((a) => a.prompt);

  const framing = VARIATIONS[variation % VARIATIONS.length];

  const parts: string[] = [];

  if (hasPhotos) {
    parts.push(
      "Using the provided reference photo(s) of a person, generate a new, photorealistic fashion image of the SAME person. " +
        "Faithfully preserve their face, hairstyle, skin tone, body type and overall identity — it must clearly look like the same individual.",
    );
  } else {
    parts.push(
      "Generate a photorealistic fashion image of a stylish model.",
    );
  }

  if (styleDescriptors.length > 0) {
    parts.push(`Dress them in ${styleDescriptors.join("; blended with ")}.`);
  }

  if (userPrompt.trim()) {
    parts.push(`Specific request from the user: ${userPrompt.trim()}.`);
  }

  parts.push(
    `Composition: ${framing}. High-end editorial fashion photography, realistic fabric textures and natural lighting, sharp focus, 4k, vertical aspect ratio. Do not add text, watermarks or logos.`,
  );

  return parts.join(" ");
}
