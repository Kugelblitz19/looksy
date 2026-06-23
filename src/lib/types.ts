export interface Aesthetic {
  id: string;
  label: string;
  emoji: string;
  /** Short blurb shown in the picker UI. */
  blurb: string;
  /** Rich descriptor injected into the image-generation prompt. */
  prompt: string;
}

/** Who the look is styled for — drives the model in demo mode and shop queries. */
export type Gender = "woman" | "man";

/** Which model to cast in demo mode (no-photo text-to-image). India-first. */
export type Ethnicity =
  | "indian"
  | "south-asian"
  | "east-asian"
  | "black"
  | "white"
  | "middle-eastern"
  | "latino"
  | "any";

export interface GeneratedLook {
  id: string;
  /** Data URL of the generated (or placeholder) image. */
  imageUrl: string;
  aesthetics: string[];
  prompt: string;
  /** Who the look was styled for, so shopping links match. */
  gender?: Gender;
  /** True when produced by the demo fallback (no API key set). */
  demo?: boolean;
}

export interface GenerateResponse {
  looks?: GeneratedLook[];
  demo?: boolean;
  error?: string;
}
