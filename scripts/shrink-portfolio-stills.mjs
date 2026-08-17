/**
 * Downloads the portfolio stills currently on R2, re-encodes them to a sane
 * delivery size, and writes the results to assets/portfolio-stills/ for you to
 * upload back to R2.
 *
 *   node scripts/shrink-portfolio-stills.mjs
 *
 * Why: the stills on R2 are 1.4-1.9MB JPEGs straight out of the export. The
 * next/image optimizer has to pull every one of those into memory before it
 * can resize, and its upstream fetch (headers plus body read) is capped at a
 * single 7s timeout — see the `formats` comment in next.config.ts. Cutting the
 * originals to a few hundred KB removes the pressure at the source rather than
 * working around it.
 *
 * This script does NOT upload. It has no R2 credentials and does not want any.
 * Upload the output yourself (wrangler or the Cloudflare dashboard) and set a
 * Cache-Control while you are there:
 *
 *   npx wrangler r2 object put <bucket>/portfolio/quality/Tsenta.jpeg \
 *     --file assets/portfolio-stills/Tsenta.jpeg \
 *     --cache-control "public, max-age=31536000, immutable"
 *
 * Keep the filenames identical so src/lib/data.json needs no edit.
 *
 * sharp is not a direct dependency; it arrives with Next. Same note as
 * generate-hero-images.mjs — if that stops being true, `npm i -D sharp`.
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "assets/portfolio-stills");

/* The cards are 16/9 and capped at 94vw, so the widest a still is ever painted
   is roughly a 2x 1440px card. 2400 covers that with headroom and still lands
   an order of magnitude under the current masters. Anything the optimizer
   needs below this it downscales itself. */
const MAX_WIDTH = 2400;
const QUALITY = 82;

/** Pulled from src/lib/data.json — the `quality/` stills, which are the ones
    that go through next/image. The .png entries next to them are card posters
    for the video path and are left alone. */
const BASE =
  "https://pub-f1d7e227fc414580986e6b19571e55d3.r2.dev/portfolio/quality";
const FILES = ["agnost.jpeg", "agnost_yc.jpeg", "rage_prompt.jpeg", "Tsenta.jpeg"];

fs.mkdirSync(OUT, { recursive: true });

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;

for (const file of FILES) {
  const url = `${BASE}/${file}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  ${file}: upstream ${res.status}, skipped`);
    continue;
  }
  const input = Buffer.from(await res.arrayBuffer());

  const output = await sharp(input)
    /* withoutEnlargement so a still that is already narrower than MAX_WIDTH is
       only re-encoded, never upscaled. */
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    /* mozjpeg is a straight win here: same quality number, meaningfully
       smaller file, and the decoder is universal. */
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();

  const dest = path.join(OUT, file);
  fs.writeFileSync(dest, output);

  const saved = (1 - output.length / input.length) * 100;
  console.log(
    `  ${file}: ${kb(input.length)} -> ${kb(output.length)} (-${saved.toFixed(0)}%)`,
  );
}

console.log(`\nWritten to ${path.relative(ROOT, OUT)}. Upload to R2 to apply.`);
