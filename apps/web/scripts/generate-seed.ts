/**
 * Generates supabase/seed.sql from the single source of truth in
 * src/lib/mock-data.ts. Run: `npx tsx scripts/generate-seed.ts`
 * Re-run whenever the mock catalogue changes.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { categories, products } from "../src/lib/mock-data";

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, "..", "supabase", "seed.sql");

const esc = (s: string) => s.replace(/'/g, "''");
const textArr = (a: string[]) => `'{${a.map((x) => `"${x}"`).join(",")}}'`;
const intOrNull = (n?: number) => (n === undefined || n === null ? "null" : String(n));
const strOrNull = (s?: string) => (s ? `'${esc(s)}'` : "null");

const header = `-- ============================================================================
-- abdmall — seed data  (GENERATED — do not edit by hand)
-- Source: src/lib/mock-data.ts  ·  Regenerate: npx tsx scripts/generate-seed.ts
-- Runs after migrations on \`supabase db reset\` / local dev.
-- Image paths are the current local /products/* files; they become Supabase
-- Storage URLs once imagery is moved to a bucket.
-- ============================================================================

`;

const catRows = categories
  .map(
    (c, i) =>
      `  ('${c.slug}','${esc(c.name)}','${esc(c.tagline)}',${textArr(c.hue)},${strOrNull(c.image)},${i + 1})`,
  )
  .join(",\n");

const categoriesSql =
  `insert into public.categories (slug, name, tagline, hue, image_url, sort_order) values\n${catRows};\n\n`;

const prodRows = products
  .map(
    (p, i) =>
      `  ('${p.slug}','${esc(p.name)}','${p.category}',${p.price},${intOrNull(p.oldPrice)},${p.stock ?? 50},${strOrNull(p.badge)},${p.rating},${p.reviews},${p.sold ?? 0},${strOrNull(p.image)},${textArr(p.swatch)},'${esc(p.blurb)}',${i + 1})`,
  )
  .join(",\n");

const productsSql =
  `insert into public.products\n` +
  `  (slug, name, category_id, price, old_price, stock, badge, rating, review_count, sold_count, image_url, swatch, blurb, sort_order)\n` +
  `select v.slug, v.name, c.id, v.price, v.old_price, v.stock,\n` +
  `       v.badge::public.product_badge, v.rating, v.review_count, v.sold_count,\n` +
  `       v.image_url, v.swatch::text[], v.blurb, v.sort_order\n` +
  `from (values\n${prodRows}\n) as v(\n` +
  `  slug, name, cat_slug, price, old_price, stock, badge, rating, review_count,\n` +
  `  sold_count, image_url, swatch, blurb, sort_order\n)\n` +
  `join public.categories c on c.slug = v.cat_slug;\n`;

writeFileSync(outPath, header + categoriesSql + productsSql);
console.log(
  `wrote ${outPath}: ${categories.length} categories, ${products.length} products`,
);
