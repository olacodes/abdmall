/**
 * Catalogue matching, done in the browser over the products already on the
 * page. No index, no service — at this catalogue size filtering an array per
 * keystroke costs nothing, and a search service would only start to earn its
 * keep with typo tolerance or a catalogue too big to send to the client.
 *
 * Two things it does that a plain `includes` doesn't: every word in the query
 * has to match something (so "ankara gown" finds the gown rather than nothing),
 * and matches are ranked, so the most obvious result is first.
 */

const DIACRITICS = /\p{Diacritic}/gu;
const NON_ALPHANUMERIC = /[^\p{L}\p{N}]+/gu;

/** Lowercase, strip accents, and reduce punctuation to single spaces, so
 *  "Dudu-Osun" matches "dudu osun" and "Aso-Ebi" matches "aso ebi". */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(NON_ALPHANUMERIC, " ")
    .trim();
}

export function tokenize(query: string): string[] {
  const normalized = normalize(query);
  return normalized ? normalized.split(" ") : [];
}

/** A normalized piece of text to search, and how much a hit in it counts. */
export type SearchField = { text: string; weight: number };

/** Normalizing on every keystroke would be the one genuinely wasteful part —
 *  callers build these once per list and reuse them. */
export function buildFields(parts: SearchField[]): SearchField[] {
  return parts.map((part) => ({
    text: normalize(part.text),
    weight: part.weight,
  }));
}

/**
 * How squarely one word sits in one field. The tiers are what make results
 * feel right: text that starts with what you typed beats text where it appears
 * mid-word, which beats a match buried inside a longer word.
 */
function fieldTier(text: string, token: string): number {
  if (text.startsWith(token)) return 3;
  if (` ${text}`.includes(` ${token}`)) return 2; // starts a later word
  if (text.includes(token)) return 1;
  return 0;
}

/**
 * Relevance across all fields, or 0 if this isn't a match at all.
 *
 * Every token must land somewhere — that's what makes a multi-word query
 * narrow the results rather than widen them. Each token scores from its best
 * field, so a name hit always outranks the same word in a description.
 */
export function scoreFields(fields: SearchField[], tokens: string[]): number {
  let total = 0;
  for (const token of tokens) {
    let best = 0;
    for (const field of fields) {
      best = Math.max(best, fieldTier(field.text, token) * field.weight);
    }
    if (best === 0) return 0;
    total += best;
  }
  return total;
}
