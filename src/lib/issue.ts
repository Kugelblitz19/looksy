/**
 * The living issue number. Looksy is a weekly — every session is "this week's
 * issue" with the reader on the cover. The number is the live ISO week, so it
 * quietly ticks forward on its own and makes each visit feel like a fresh drop.
 */
export function issueNumber(date: Date = new Date()): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  // ISO 8601: week belongs to the year of its Thursday.
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return (
    1 +
    Math.round((d.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000))
  );
}

/** "№26" — zero-padded to two digits, with the numero sign. */
export function issueLabel(date?: Date): string {
  return `№${String(issueNumber(date)).padStart(2, "0")}`;
}

/** A stable per-look plate number derived from its id (so it doesn't reflow). */
export function plateLabel(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const n = (Math.abs(h) % 99) + 1;
  return `№${String(n).padStart(2, "0")}`;
}
