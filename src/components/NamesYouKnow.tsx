// const LOGOS = [
//   {
//     key: "stan",
//     name: "Stan",
//     src: "https://framerusercontent.com/images/5zZ2m0WSCVqKZ0zi7NFAQKGC40.webp",
//   },
//   {
//     key: "replit",
//     name: "Replit",
//     src: "https://framerusercontent.com/images/cXpuCEz1g7SPOrbPsTFTqEDxsw8.png",
//   },
//   {
//     key: "cognition",
//     name: "Cognition",
//     src: "https://framerusercontent.com/images/ifGcsJAOT1RNXcqjrNKna14eQ.png",
//   },
//   {
//     key: "elevenlabs",
//     name: "ElevenLabs",
//     src: "https://framerusercontent.com/images/p8E0uE5aicrRgbwR8CpsVefxjug.png",
//   },
//   {
//     key: "buldak",
//     name: "Buldak",
//     src: "https://framerusercontent.com/images/2ECE20XMXEhEHdHo1zUVLVkN0.png",
//   },
//   {
//     key: "composio",
//     name: "Composio",
//     src: "https://framerusercontent.com/images/ifTAFupie0WzA2RKwAFIKiqDYY.webp",
//   },
//   {
//     key: "modal",
//     name: "Modal",
//     src: "https://framerusercontent.com/images/WUIa7jcMCZD1TMsQZTuFQGvwzU.png",
//   },
//   {
//     key: "listen",
//     name: "Listen Labs",
//     src: "https://framerusercontent.com/images/C7doKt4AmnjVAfDTrdvLW1L8O8E.webp",
//   },
// ] as const;

import type { CSSProperties } from "react";
import { CLIENT_LOGOS } from "@/lib/site";

/**
 * Plain <img>, not a CSS mask — the mask painted every logo as a solid
 * ink-colored silhouette, which loses each brand's actual color (Click's
 * purple, Biconomy's orange, etc). A real <img> just shows the source art.
 *
 * width/height are each SVG's real intrinsic size, passed to the <img> so
 * the browser can reserve its box before the file has even started
 * downloading — the previous plain-<img> attempt skipped this and the
 * wordmark cells (whose width depends on their own aspect ratio) collapsed
 * to 0 until decode finished, jolting the row's layout mid-scroll.
 */
const NATURAL_SIZE: Record<string, { w: number; h: number }> = {
  "context-dev": { w: 772, h: 531 },
  tsenta: { w: 500, h: 500 },
  click: { w: 720, h: 720 },
  "agnost-ai": { w: 506, h: 80 },
  duo: { w: 133, h: 51 },
  starknet: { w: 178, h: 41 },
  agglayer: { w: 411, h: 146 },
  aptos: { w: 87, h: 25 },
  biconomy: { w: 164, h: 32 },
};

export default function NamesYouKnow() {
  return (
    <section className="names-you-know" aria-label="Names you know">
      <span className="names-you-know-label">Names you know</span>
      <div className="names-you-know-track-mask">
        <div className="names-you-know-track">
          {/* Four copies, not two — this bar spans the hero's own width
              (left:30/right:30 on the section, not the narrower card), which
              on a wide viewport is wider than two copies of an 8-logo list
              combined. The visible window then ran past the end of the
              actual track content into empty space just before the loop
              reset, which is what showed as a blank gap before the jump
              back to the first logo. Quadrupling gives the same seamless
              loop (four identical quarters instead of two identical halves,
              -25% instead of -50%) with enough total width to stay covered
              on any realistic screen. */}
          {[
            ...CLIENT_LOGOS,
            ...CLIENT_LOGOS,
            ...CLIENT_LOGOS,
            ...CLIENT_LOGOS,
          ].map((logo, i) => (
            <div
              className={`names-you-know-img${logo.nameInLogo ? " is-wordmark" : ""}`}
              key={`${logo.key}-${i}`}
            >
              <span
                className="names-you-know-icon"
                style={{ "--logo-scale": logo.scale ?? 1 } as CSSProperties}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.src}
                  alt={logo.nameInLogo ? logo.name : ""}
                  aria-hidden={logo.nameInLogo ? undefined : true}
                  loading="eager"
                  width={NATURAL_SIZE[logo.key].w}
                  height={NATURAL_SIZE[logo.key].h}
                />
              </span>

              {!logo.nameInLogo && (
                <span
                  className={`names-you-know-text${logo.key === "tsenta" ? " names-you-know-text--tsenta" : ""}`}
                  aria-hidden={i >= CLIENT_LOGOS.length ? true : undefined}
                >
                  {logo.name}
                </span>
              )}

              {logo.batch ? (
                <span
                  className="names-you-know-batch"
                  aria-hidden={i >= CLIENT_LOGOS.length ? true : undefined}
                >
                  {logo.batch}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
