export interface Aesthetic {
  id: string;
  label: string;
  emoji: string;
  /** Short blurb shown in the picker UI. */
  blurb: string;
  /** Rich descriptor injected into the image-generation prompt. */
  prompt: string;
}

export interface GeneratedLook {
  id: string;
  /** Data URL of the generated (or placeholder) image. */
  imageUrl: string;
  aesthetics: string[];
  prompt: string;
  /** True when produced by the demo fallback (no API key set). */
  demo?: boolean;
}

export interface GenerateResponse {
  looks?: GeneratedLook[];
  demo?: boolean;
  error?: string;
}
