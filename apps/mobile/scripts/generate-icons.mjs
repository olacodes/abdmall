/**
 * Generates the app icon / adaptive icon / splash artwork from the same cart
 * mark the web storefront uses (apps/web/src/app/icon.svg), so both platforms
 * ship one brand.
 *
 * The PNGs are committed — this only needs re-running when the mark changes:
 *
 *   node scripts/generate-icons.mjs
 *
 * `sharp` is not a dependency of this app; it resolves from the repo root
 * (hoisted via apps/web). Install it there if the import fails.
 */

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const OUT = path.join(fileURLToPath(new URL("..", import.meta.url)), "assets/images");

// Brand tokens (mirrors apps/web/src/app/globals.css @theme)
const BRAND = "#14110b"; // near-black
const PAPER = "#f6f3ec"; // warm paper

// Gold gradient stops. `bright` is the web icon's ramp — it needs a dark plate
// behind it. `deep` keeps the pale end off so the mark still reads on paper.
const GOLD_BRIGHT = ["#7a5a16", "#b8860b", "#d8a72e", "#f3d98b"];
const GOLD_DEEP = ["#6b4e13", "#8a6a1c", "#b8860b", "#c9962a"];

// The mark itself, in its own 24x24 space. Stroked, so the visual bounds are
// the path extents padded by half the stroke width (1.7 / 2 = 0.85).
const MARK = `<path d="M2.5 4h2.2l1.2 10.2a1.5 1.5 0 0 0 1.5 1.3h8.7a1.5 1.5 0 0 0 1.5-1.2L21 7H6" />
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="17" cy="20" r="1.4" />`;
const MARK_W = 20.2;
const MARK_CX = 11.75;
const MARK_CY = 12.7;

/**
 * @param {object} o
 * @param {number} o.size      canvas edge, px
 * @param {number} o.markWidth mark width as a fraction of the canvas
 * @param {string[]} [o.gold]  gradient stops, or omit in favour of `flat`
 * @param {string} [o.flat]    solid stroke colour (monochrome icon)
 * @param {string} [o.bg]      plate colour, or omit for transparent
 * @param {number} [o.radius]  plate corner radius, px
 */
function markSvg({ size, markWidth, gold, flat, bg, radius = 0 }) {
  const scale = (size * markWidth) / MARK_W;
  const stops = (gold ?? []).map(
    (c, i, a) => `<stop offset="${i / (a.length - 1)}" stop-color="${c}" />`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">${stops.join("")}</linearGradient>
  </defs>
  ${bg ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${bg}" />` : ""}
  <g
    transform="translate(${size / 2} ${size / 2}) scale(${scale}) translate(${-MARK_CX} ${-MARK_CY})"
    fill="none"
    stroke="${flat ?? "url(#g)"}"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    ${MARK}
  </g>
</svg>`;
}

/** iOS rejects icons with an alpha channel, so those get flattened. */
async function png(file, svg, { opaqueOn } = {}) {
  let img = sharp(Buffer.from(svg));
  if (opaqueOn) img = img.flatten({ background: opaqueOn });
  await writeFile(path.join(OUT, file), await img.png({ compressionLevel: 9 }).toBuffer());
  console.log("wrote", file);
}

// App icon: full-bleed plate, no rounding — iOS and Android mask it themselves.
await png(
  "icon.png",
  markSvg({ size: 1024, markWidth: 0.5, gold: GOLD_BRIGHT, bg: BRAND }),
  { opaqueOn: BRAND },
);

// Android adaptive layers. Only the centre 66% survives every mask shape, so
// the mark sits well inside that; the plate comes from `backgroundColor`.
await png(
  "android-icon-foreground.png",
  markSvg({ size: 1024, markWidth: 0.4, gold: GOLD_BRIGHT }),
);
await png(
  "android-icon-monochrome.png",
  markSvg({ size: 1024, markWidth: 0.4, flat: "#ffffff" }),
);

// Splash marks — sized by `imageWidth` in app.json, so these are just the mark.
await png("splash-icon.png", markSvg({ size: 1024, markWidth: 0.84, gold: GOLD_DEEP }));
await png(
  "splash-icon-dark.png",
  markSvg({ size: 1024, markWidth: 0.84, gold: GOLD_BRIGHT }),
);

// Favicon for the Expo web build — rounded, since nothing masks it.
await png(
  "favicon.png",
  markSvg({ size: 256, markWidth: 0.5, gold: GOLD_BRIGHT, bg: BRAND, radius: 56 }),
);
