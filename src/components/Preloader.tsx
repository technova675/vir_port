"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

/**
 * VHS cassette loader. The left spool grows and the right shrinks as
 * loading advances, so the cassette visibly "rewinds" to 100%.
 */
export default function Preloader({
  progress,
  ready,
}: {
  progress: number;
  ready: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);

  // Hold briefly after the first frame lands so the rewind reads as
  // deliberate rather than a flash.
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => setDismissed(true), 900);
    return () => window.clearTimeout(t);
  }, [ready]);

  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  const leftScale = 0.4 + progress * 0.6;
  const rightScale = 1 - progress * 0.6;
  const tapeLeft = -14 - progress * 10;
  const tapeRight = -32 + progress * 10;

  return (
    <div id="preloader" className={dismissed ? "hidden" : undefined}>
      <div id="vhs-wrapper">
        <div id="vhs-base" />

        <div
          className="vhs-spool-left"
          style={{ transform: `scale(${leftScale.toFixed(3)})` }}
        />
        <div className="vhs-inner-spool-left" />
        <div
          className="vhs-spool-right"
          style={{ transform: `scale(${rightScale.toFixed(3)})` }}
        />
        <div className="vhs-inner-spool-right" />
        <div
          className="vhs-tape-left"
          style={{ transform: `rotate(${tapeLeft}deg) translateX(62px)` }}
        />
        <div
          className="vhs-tape-right"
          style={{ transform: `rotate(${tapeRight}deg) translateX(76px)` }}
        />

        <div id="vhs-cartridge">
          <div id="vhs-cartridge-top" />
          <div id="vhs-windows">
            <div id="vhs-window-left" />
            <div id="vhs-label">
              <div id="vhs-label-block">
                <div id="vhs-title">{pct}%</div>
                <div id="vhs-title2">
                  {SITE.loaderTitle.split("\n").map((line, i) => (
                    <span key={line}>
                      {i > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </div>
                <div id="vhs-rating">{SITE.ratingBadge}</div>
              </div>
            </div>
            <div id="vhs-window-right" />
          </div>
          <div id="vhs-cartridge-bottom" />
        </div>

        <div id="vhs-lid">
          <div id="vhs-lid-text">
            Insert this side into the recorder<strong>▲</strong>Do not touch
            the tape inside
          </div>
        </div>
      </div>

      <div className="loader-text">rewinding site</div>
    </div>
  );
}
