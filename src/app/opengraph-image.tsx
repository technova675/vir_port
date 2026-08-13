import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "VIR — We make videos that internet loves";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card is the hero section, redrawn.
 *
 * Not a screenshot — Satori (what ImageResponse runs on) renders its own
 * subset of CSS, so this is a hand-rebuild of Hero.tsx at 1200x630: the same
 * bordered card floating in white, the same crossing hairlines, the same
 * badge / headline / orange slashes / services row. Numbers are scaled up from
 * the live hero, which is drawn against an ~820px card in a viewport rather
 * than a fixed 1200px frame.
 *
 * Kept deliberately close to globals.css `.matter-hero-*`. If the hero's copy
 * or proportions change, this file has to be updated by hand — there is no
 * shared source between them.
 *
 * Read at module scope, not per-request: these are static files, and the route
 * is prerendered at build time.
 */
const [geistLight, geistSemiBold, aeonikMedium, ycWordmark] =
  await Promise.all([
    /* ttf, converted from the woff2 originals in src/fonts. ImageResponse
       accepts only ttf/otf/woff — handing it the app's woff2 files throws at
       build. Geist additionally ships as a variable font, which Satori cannot
       parse at all (it dies on the gvar tables), so its Light is a static
       instance pinned at wght 300 — the exact weight the hero's h1 asks for.
       See assets/og/README.md for both conversions. */
    readFile(join(process.cwd(), "assets/og/Geist-Light.ttf")),
    readFile(join(process.cwd(), "assets/og/Geist-SemiBold.ttf")),
    readFile(join(process.cwd(), "assets/og/Aeonik-Medium.ttf")),
    /* PNG, not the .jpg sitting next to it in public/ — JPEG has no alpha, so
       that copy renders the wordmark's transparent ground as a black box on
       the white pill. Decoded from the .webp original at 2x the placed size. */
    readFile(join(process.cwd(), "assets/og/yc-wordmark.png")),
  ]);

const ycSrc = `data:image/png;base64,${ycWordmark.toString("base64")}`;

const HAIRLINE = "rgba(11, 11, 11, 0.18)";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#fff",
          color: "#0b0b0b",
          fontFamily: "Aeonik",
        }}
      >
        {/* The two hairlines that cross the frame. In the live hero these are
            flex-grown/calc'd against the card; at a fixed 1200x630 they can be
            absolutely placed, which is also all Satori would support. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 600,
            width: 1,
            height: 79,
            background: HAIRLINE,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 315,
            left: 0,
            width: 1200,
            height: 1,
            background: HAIRLINE,
          }}
        />

        {/* The card. The live one lays a blurred translucent plate over the
            page (backdrop-filter), which Satori does not implement — but the
            page behind it is white, so a plain white fill is identical here. */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 940,
            height: 472,
            padding: "56px 48px",
            border: `1px solid ${HAIRLINE}`,
            background: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 34,
              padding: "12px 24px",
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 999,
              fontSize: 20,
              fontWeight: 500,
            }}
          >
            <span>Trusted by</span>
            <img src={ycSrc} width={150} height={43} alt="" />
            <span>companies</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontFamily: "Geist",
              fontWeight: 300,
              fontSize: 62,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              textTransform: "uppercase",
            }}
          >
            <span>We make videos</span>
            <span>that internet loves</span>
          </div>

          <div
            style={{
              margin: "26px 0",
              color: "#ff621c",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 3,
            }}
          >
            ///
          </div>

          {/* marginTop:auto in the hero pins this to the card's bottom edge;
              the card has a fixed height here, so the same rule applies. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginTop: "auto",
              fontFamily: "Geist",
              fontWeight: 600,
              fontSize: 24,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
            }}
          >
            <span>launch film</span>
            <span style={{ color: "#ff621c" }}>/</span>
            <span>Product Videos</span>
            <span style={{ color: "#ff621c" }}>/</span>
            <span>Founder Videos</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Aeonik", data: aeonikMedium, style: "normal", weight: 500 },
        { name: "Geist", data: geistLight, style: "normal", weight: 300 },
        { name: "Geist", data: geistSemiBold, style: "normal", weight: 600 },
      ],
    },
  );
}
