import { getAesthetic } from "./aesthetics";
import { ethnicityDescriptor } from "./ethnicity";
import type { Ethnicity, Gender } from "./types";

/**
 * Slightly varies framing/angle between variations so a single request returns
 * a diverse set of looks rather than near-duplicates.
 */
const VARIATIONS = [
  // Mix full-body (shows the whole outfit) with three-quarter-length crops
  // (from the thigh/knee up) — the closer crops give the face far more pixels,
  // so it renders fresh instead of warped.
  "full-body, straight-on, eye-level, standing, the face clear and in focus",
  "three-quarter length from mid-thigh up, relaxed confident pose, face clearly in frame and in sharp focus",
  "full-body, slight low camera angle, walking toward camera, the face clear and in focus",
  "three-quarter length from the knees up, turning toward the camera, face clearly in frame and in sharp focus",
];

interface BuildPromptOpts {
  aestheticIds: string[];
  userPrompt: string;
  hasPhotos: boolean;
  /** Who to style — used only when there's no photo to take identity from. */
  gender?: Gender;
  /** Which model to cast — used only when there's no photo. */
  ethnicity?: Ethnicity;
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
  ethnicity = "indian",
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
    // (otherwise it defaults to a woman every time) and the chosen cast
    // (Indian by default, since Looksy is India-first).
    const who =
      gender === "man" ? "man" : gender === "woman" ? "woman" : "person";
    parts.push(
      `Generate a photorealistic full-body fashion photograph of ${ethnicityDescriptor(ethnicity, who)} with a fresh, natural, symmetrical face and clear, realistic skin.`,
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
    `Show the complete outfit head-to-toe on the person. Composition: ${framing}. High-end editorial fashion photography shot on an 85mm lens, realistic fabric drape and fit, soft natural lighting, sharp focus throughout. The face must be fresh, natural and symmetrical, with clear undistorted features, detailed eyes and flawless realistic skin — absolutely no warping, melting or artifacts on the face. Ultra-detailed, high resolution. Exactly one person, full body in frame, face clearly visible. No text, watermarks, logos or borders.`,
  );

  return parts.join(" ");
}
