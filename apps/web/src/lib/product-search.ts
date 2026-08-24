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

export type SearchFields = { name: string; blurb: string; category: string };

export type SearchEntry = {
  name: string;
  blurb: string;
  category: string;
};

/** Normalizing every product on every keystroke would be wasteful — callers
 *  build this once per catalogue and reuse it. */
export function buildEntry(fields: SearchFields): SearchEntry {
  return {
    name: normalize(fields.name),
    blurb: normalize(fields.blurb),
    category: normalize(fields.category),
  };
}

/**
 * How well one word matches one product. Zero means it doesn't.
 *
 * The ordering is what makes results feel right: a name that starts with what
 * you typed beats one where it appears mid-word, and anything in the name
 * beats a passing mention in the description.
 */
function tokenScore(entry: SearchEntry, token: string): number {
  if (entry.name.startsWith(token)) return 6;
  if (` ${entry.name}`.includes(` ${token}`)) return 4; // starts a later word
  if (entry.name.includes(token)) return 3;
  if (entry.category.includes(token)) return 2;
  if (entry.blurb.includes(token)) return 1;
  return 0;
}

/**
 * Relevance of a product for the whole query, or 0 if it isn't a match.
 * Every token must land somewhere — that's what makes multi-word queries
 * narrow the results instead of widening them.
 */
export function scoreEntry(entry: SearchEntry, tokens: string[]): number {
  let total = 0;
  for (const token of tokens) {
    const score = tokenScore(entry, token);
    if (score === 0) return 0;
    total += score;
  }
  return total;
}
