/**
 * Encodes the hero masters in assets/hero/ into the responsive avif/webp/jpeg
 * sets that public/hero/ serves, plus the base64 placeholders used in
 * globals.css.
 *
 *   node scripts/generate-hero-images.mjs
 *
 * Run this after re-exporting a master. The output is committed, so this is
 * not part of `npm run build` — it is a one-off you run by hand.
 *
 * sharp is not a direct dependency; it arrives with Next, which uses it for
 * next/image. If that ever stops being true, `npm i -D sharp`.
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "assets/hero");
const OUT = path.join(ROOT, "public/hero");

/* Widths are driven by how the crops are painted, not by the master's size.
   Both are `object-fit: cover` in a box taller than the viewport, so the
   browser scales them to HEIGHT — see the `sizes` comment in Hero.tsx. That
   pushes the top width well past the viewport width, hence 3200 / 2000. */
const JOBS = [
  { src: "hero_section.png", base: "hero", widths: [1280, 1920, 2560, 3200] },
  { src: "hero_section_mobile.png", base: "hero-m", widths: [640, 900, 1200, 1600, 2000] },
];

fs.mkdirSync(OUT, { recursive: true });

for (const job of JOBS) {
  const input = path.join(SRC, job.src);
  const meta = await sharp(input).metadata();

  for (const width of job.widths) {
    // withoutEnlargement alone would emit a correctly-named file at the wrong
    // width, which srcSet would then advertise as a lie. Skip instead.
    if (width > meta.width) continue;
    const at = () => sharp(input).resize({ width });

    await at().avif({ quality: 55, effort: 6 }).toFile(path.join(OUT, `${job.base}-${width}.avif`));
    await at().webp({ quality: 78, effort: 5 }).toFile(path.join(OUT, `${job.base}-${width}.webp`));
    await at()
      .jpeg({ quality: 80, mozjpeg: true, progressive: true })
      .toFile(path.join(OUT, `${job.base}-${width}.jpg`));

    console.log(`${job.base}-${width}`);
  }

  // The placeholder: 24px wide and blurred, small enough (~100-160 bytes) to
  // inline in the stylesheet, so the stage paints a readable composition
  // instead of black while the full crop streams in.
  const lqip = await sharp(input).resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
  console.log(
    `\n${job.base} placeholder — paste into .hero-pan in globals.css (${lqip.length} bytes):\n` +
      `url("data:image/webp;base64,${lqip.toString("base64")}")\n`,
  );
}
