"use client";

import { InlineWidget } from "react-calendly";
import { CTA } from "@/lib/site";

/**
 * Calendly inline embed.
 *
 * This was the raw snippet — a bare .calendly-inline-widget div plus a
 * lazy-loaded widget.js. That script initialises by scanning the document for
 * matching divs once, when it loads, which races React: if the scan lands on
 * the wrong side of a mount or re-render, the widget never initialises and you
 * are left staring at the preloader forever.
 *
 * react-calendly closes that race — it loads the script itself and calls
 * initInlineWidget explicitly against its own node, after mount, so the div
 * always exists first. It also ships the spinner and the iframe sizing CSS.
 *
 * NOTE: do not drive the container height from the widget's own
 * `onPageHeightResize` message without testing it in a browser first. That was
 * tried to kill the trailing whitespace under the month view and it collapsed
 * the embed entirely on desktop while changing nothing on mobile. The height
 * lives in CSS (see `.cta-booking .cta-calendly`) until someone has actually
 * logged what Calendly posts here.
 */
export default function CalendlyEmbed() {
  return (
    <InlineWidget
      url={CTA.calendlyUrl}
      /* className REPLACES the package's default rather than merging with it
         (see `this.props.className || defaultClassName` in its render), so
         .calendly-inline-widget has to be repeated by hand — its stylesheet
         hangs the `iframe { width:100%; height:100% }` rule off that class,
         and without it the iframe has no size. */
      className="calendly-inline-widget cta-calendly"
    />
  );
}
