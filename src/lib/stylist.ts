import { getAesthetic } from "./aesthetics";
import type { Gender } from "./types";

/**
 * Slightly varies framing/angle between variations so a single request returns
 * a diverse set of looks rather than near-duplicates.
 */
const VARIATIONS = [
  "full-body, straight-on, eye-level, standing",
  "full-body, three-quarter angle, relaxed confident pose",
  "full-body, slight low camera angle, walking toward camera",
  "full-body, turning toward the camera",
];

interface BuildPromptOpts {
  aestheticIds: string[];
  userPrompt: string;
  hasPhotos: boolean;
  /** Who to style — used only when there's no photo to take identity from. */
  gender?: Gender;
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
  gender,
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
      "VIRTUAL TRY-ON. The provided photo(s) show ONE real person. Generate a new, photorealistic full-body photograph of the EXACT SAME individual. " +
        "Preserve their identity precisely: the same face structure, eyes, nose, lips, jawline and skin tone, the same hairstyle and hair colour, their natural body proportions, and natural skin texture and pores. They must be instantly recognizable as the same person.",
    );
  } else {
    // No photo → text-to-image picks the model. State gender explicitly
    // (otherwise it defaults to a woman every time) and Indian ethnicity, since
    // Looksy is India-first — without this the model defaults to Western.
    const who =
      gender === "man" ? "man" : gender === "woman" ? "woman" : "person";
    parts.push(
      `Generate a photorealistic full-body fashion photograph of a stylish young Indian ${who} model with South Asian features and warm brown skin.`,
    );
  }

  if (styleDescriptors.length > 0) {
    parts.push(`Dress this person in ${styleDescriptors.join("; blended with ")}.`);
  }

  if (userPrompt.trim()) {
    parts.push(`Also incorporate these details: ${userPrompt.trim()}.`);
  }

  if (hasPhotos) {
    parts.push(
      "Change ONLY their clothing — do not alter the face or body. Do NOT beautify, slim, smooth, retouch, age, or replace them with a different person; no morphing.",
    );
  }

  parts.push(
    `Show the complete outfit head-to-toe on the person. Composition: ${framing}. High-end editorial fashion photography, realistic fabric drape and fit, natural lighting, sharp focus. Exactly one person, full body in frame. No text, watermarks, logos or borders.`,
  );

  return parts.join(" ");
}
