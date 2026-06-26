/**
 * Lightweight prompt safety screen for image generation. This is a pragmatic,
 * dependency-free blocklist — NOT a full moderation system — aimed at the
 * categories that are never acceptable (sexualization of minors, explicit
 * sexual content, non-consensual/abuse), so the app can't be trivially turned
 * into an abuse tool and to satisfy app-store policy. For stronger coverage,
 * route prompts through a hosted moderation API as well.
 *
 * Note: "nude" is intentionally allowed on its own because it's a common
 * fashion colour ("nude heels"); only clearly-unsafe contexts are blocked.
 */
const BLOCK_PATTERNS: RegExp[] = [
  /\b(porn|pornographic|hentai|nsfw)\b/i,
  /\b(naked|topless)\b/i,
  /\b(fully|completely)\s+(nude|naked)\b/i,
  /\bnude\b[^.]{0,15}\b(body|woman|man|girl|boy|person|figure|model|breasts?)\b/i,
  /\b(genitals?|penis|vagina|cum|blow ?job|hand ?job|sexual intercourse|explicit sex)\b/i,
  /\b(rape|molest|non-?consensual)\b/i,
  // Minor + sexual context, in either order — zero tolerance.
  /\b(child|children|kid|kids|minor|minors|underage|teen|teens|preteen|toddler|infant|baby|babies|schoolgirl|schoolboy|loli|shota)\b[^.]{0,40}\b(nude|naked|sex|sexual|porn|nsfw|erotic|lingerie|topless|undress|seductive|provocative)/i,
  /\b(nude|naked|sex|sexual|porn|nsfw|erotic|topless|undress|seductive)\b[^.]{0,40}\b(child|children|kid|minor|underage|teen|preteen|toddler|infant|schoolgirl|schoolboy)\b/i,
  /\b(deep ?fake)\b[^.]{0,30}\b(nude|naked|porn|sexual)/i,
];

export interface ScreenResult {
  ok: boolean;
  reason?: string;
}

/** Returns { ok:false } if the prompt trips a safety rule. */
export function screenPrompt(text: string): ScreenResult {
  const t = (text || "").toLowerCase();
  if (!t.trim()) return { ok: true };
  for (const re of BLOCK_PATTERNS) {
    if (re.test(t)) {
      return {
        ok: false,
        reason: "That request isn't allowed. Try describing a different look.",
      };
    }
  }
  return { ok: true };
}
