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
      "VIRTUAL TRY-ON. The reference photo(s) show ONE real person. Generate a new, photorealistic photograph of THAT EXACT SAME person. " +
        "Keep their face, facial features, expression, skin tone, hair and body type identical to the reference so they are immediately recognizable as the same individual — do NOT beautify, slim, age, lighten or otherwise change their face or body. Only change their clothing and the surroundings.",
    );
  } else {
    parts.push(
      "Generate a photorealistic full-body fashion photograph of a stylish model.",
    );
  }

  if (styleDescriptors.length > 0) {
    parts.push(`Dress this person in ${styleDescriptors.join("; blended with ")}.`);
  }

  if (userPrompt.trim()) {
    parts.push(`Also incorporate these details: ${userPrompt.trim()}.`);
  }

  parts.push(
    `Show the complete outfit clearly on the person. Composition: ${framing}. High-end editorial fashion photography, true-to-life proportions, realistic fabric textures and natural lighting, sharp focus, vertical 3:4 portrait. Exactly one person. No text, watermarks, logos or borders.`,
  );

  return parts.join(" ");
}
