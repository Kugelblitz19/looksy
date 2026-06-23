import type { Ethnicity } from "./types";

/** Selector options — Indian first (the default), then a diverse cast. */
export const ETHNICITY_OPTIONS: { value: Ethnicity; label: string }[] = [
  { value: "indian", label: "Indian" },
  { value: "south-asian", label: "South Asian" },
  { value: "east-asian", label: "East Asian" },
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "middle-eastern", label: "Middle Eastern" },
  { value: "latino", label: "Latino" },
  { value: "any", label: "Any" },
];

/** The descriptive phrase woven into the image prompt for each cast. */
const FEATURES: Record<Ethnicity, string> = {
  indian: "Indian, South Asian features, warm brown skin",
  "south-asian": "South Asian features",
  "east-asian": "East Asian features",
  black: "Black, with dark skin",
  white: "white / Caucasian, with fair skin",
  "middle-eastern": "Middle Eastern features",
  latino: "Latino / Hispanic features",
  any: "",
};

/** Build the model description, e.g. "a stylish young Indian … woman model". */
export function ethnicityDescriptor(e: Ethnicity, who: string): string {
  const feat = FEATURES[e] ?? FEATURES.indian;
  return feat
    ? `a stylish young ${feat} ${who} model`
    : `a stylish ${who} model`;
}

export function isEthnicity(v: unknown): v is Ethnicity {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(FEATURES, v);
}
