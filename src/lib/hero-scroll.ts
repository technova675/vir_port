/**
 * Shared timing for the hero's scroll-driven animations.
 *
 * The pan (Hero) and the line-2 reveal (HeroText) are separate ScrollTriggers
 * on the same trigger element. They must agree on both numbers or they drift
 * apart mid-scroll — which reads as one of them lagging.
 */

/** Scroll distance the pan is spread across, as a % of viewport height. */
export const SCROLL_LENGTH = "+=200%";

/**
 * Scrub smoothing, in seconds.
 *
 * 0.3, not 1. Lenis is ALREADY easing the scroll position (duration 1.1), and
 * scrub applies a second, independent ease on top of the eased value. At
 * scrub: 1 the two stack, so the pan trails the wheel/finger by most of a
 * second — the page has stopped moving and the image is still catching up.
 * That is the "lag" you can see; it is not dropped frames.
 *
 * Small but non-zero: Lenis emits a scroll event per RAF tick, and `true`
 * (instant) would forward any single jittery delta straight to the transform.
 */
export const SCRUB = 0.3;

/**
 * The scrub value to use on this device, read once when a trigger is built.
 *
 * Touch gets `true` (track the scroll position exactly), not 0.3. The two
 * platforms are smoothed by different things:
 *
 *   desktop — Lenis eases the wheel, so scrub adds a small second ease to take
 *             the edge off Lenis' per-RAF deltas.
 *   touch   — scrolling is native and handled by the compositor, and the
 *             momentum curve is already smooth. Any scrub here is pure added
 *             latency: the page moves under the finger and the pan arrives
 *             late, which is the "trails behind" half of the mobile bug.
 *
 * Pointer type does not change over a session, so reading it at build time is
 * safe; the triggers are rebuilt on resize by ScrollTrigger anyway.
 */
export function scrubFor(): number | boolean {
  if (typeof window === "undefined") return SCRUB;
  return window.matchMedia("(pointer: coarse)").matches ? true : SCRUB;
}

/**
 * How far the pin should hold, given the element being panned.
 *
 * Touch gets a pin exactly as long as the image's travel, so the picture moves
 * 1px for every 1px scrolled. Desktop keeps SCROLL_LENGTH unchanged.
 *
 * The reason is a ratio problem, not a performance one. While pinned the page
 * itself does not move, so the pan is the ONLY feedback a scroll produces. At
 * `+=200%` the pin holds for two full viewports — ~1600px of swiping on a
 * phone — while the mobile crop can only travel `148svh - innerHeight`, about
 * 300px. That is 5px of scrolling per 1px of movement, and it reads exactly
 * as reported: the page is stuck and takes ten-plus swipes to get past.
 *
 * Matching the pin to the travel makes the image track the finger precisely,
 * so a pinned hero feels like ordinary scrolling. Desktop is left alone
 * because a wheel covers that distance quickly and it already feels right.
 *
 * Called as a ScrollTrigger function value with invalidateOnRefresh, so it is
 * re-evaluated on every refresh rather than baked in at creation.
 */
export function panEnd(pan: HTMLElement | null): string {
  if (typeof window === "undefined" || !pan) return SCROLL_LENGTH;
  if (!window.matchMedia("(pointer: coarse)").matches) return SCROLL_LENGTH;

  // Same expression the pan tween uses for `y`, so the two cannot disagree.
  const travel = pan.offsetHeight - window.innerHeight;
  // Guard the degenerate case: if the crop is not taller than the viewport
  // there is nothing to pan, and "+=0" would make a zero-length trigger.
  return travel > 1 ? `+=${Math.round(travel)}` : SCROLL_LENGTH;
}
