"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroText from "./HeroText";
import { panEnd, scrubFor } from "@/lib/hero-scroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * On a phone, scrolling shows and hides the browser chrome, which changes
 * window.innerHeight and fires `resize`. ScrollTrigger's default response is a
 * full refresh: re-measure every trigger, recompute the pin spacer, and
 * re-run every `invalidateOnRefresh` function value — including this pan's,
 * which reads offsetHeight and innerHeight. Doing that *during* a scroll is
 * a layout-and-recalc storm on the exact frames that need to be cheap, and it
 * is why the mobile pan stutters at the top of the page.
 *
 * ignoreMobileResize tells ScrollTrigger to skip refreshes caused purely by a
 * viewport-height change on touch devices. Width changes and orientation
 * changes still refresh, so a genuine relayout is still handled.
 *
 * Module scope, not an effect: this must be set before any ScrollTrigger is
 * created, and both hero components create theirs in a layout effect.
 */
ScrollTrigger.config({ ignoreMobileResize: true });

/* The crops are `object-fit: cover` inside a box that is TALLER than the
   viewport (.hero-pan is 160vh / 148svh), so the browser scales the bitmap to
   the height, not the width — a plain `sizes="100vw"` would under-pick and
   ship a soft image. These express the real painted width:

     desktop  1.60 * 100vh * (4180/2352) = 284vh, floored at 100vw
     mobile   1.48 * 100svh * (3764/6688) =  83vh, floored at 100vw

   Browsers too old for max() in `sizes` fall back to the 100vw default, which
   is merely conservative, not broken. */
const SIZES_DESKTOP = "max(100vw, 284vh)";
const SIZES_MOBILE = "max(100vw, 83vh)";

export default function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Shared by the pan and by HeroText's line-2 reveal. Both must resolve to
  // the same end or the reveal is timed against a different scroll range than
  // the image it is cued to. Read lazily: imageRef is null at first render,
  // and ScrollTrigger only calls this at refresh time, after mount.
  const endValue = useCallback(() => panEnd(imageRef.current), []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const image = imageRef.current;
    if (!stage || !image) return;

    // Runs on every size. The travel is derived from the laid-out element
    // (offsetHeight - viewport), so the same code drives both crops — only
    // the .hero-pan height differs between them, and that lives in CSS.
    const ctx = gsap.context(() => {
      gsap.set(image, { force3D: true });

      gsap.to(image, {
        // Function value + invalidateOnRefresh => recomputed on every resize.
        y: () => -(image.offsetHeight - window.innerHeight),
        ease: "none",
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: endValue,
          scrub: scrubFor(),
          pin: true,
          // No anticipatePin. It exists to hide the one-frame gap native
          // scrolling can show when a pin engages, by pinning fractionally
          // early. Lenis applies scroll in its own RAF loop that ScrollTrigger
          // reads from synchronously, so that gap never happens here — and
          // pinning early instead nudges the element ahead of the scroll,
          // which shows as a jump at the top of the section.
          invalidateOnRefresh: true,
        },
      });
    }, stage);

    return () => ctx.revert();
  }, [endValue]);

  return (
    <section
      ref={stageRef}
      className="hero-stage relative h-screen w-full overflow-hidden"
    >
      {/* Taller than the viewport, so there is always more image below to
          pan into. Height lives in CSS, not an inline style, so the mobile
          media query can tune it — an inline style would always beat it. */}
      <div
        ref={imageRef}
        className="hero-pan absolute inset-x-0 top-0 will-change-transform"
      >
        {/* <picture>, not next/image: the crops are different aspect ratios
            (landscape vs portrait), and `media` swaps them with a SINGLE
            download. Two <Image>s would fetch both.

            Source order matters — the browser takes the first <source> whose
            media AND type it understands, so it is narrowest-first:
              mobile avif -> mobile webp -> mobile jpeg
              desktop avif -> desktop webp -> <img> jpeg fallback
            The final <img> is plain JPEG with no type, which is the universal
            floor: Safari < 14, older Edge, anything without avif/webp. */}
        <picture>
          <source
            media="(max-width: 900px)"
            type="image/avif"
            sizes={SIZES_MOBILE}
            srcSet="/hero/hero-m-640.avif 640w, /hero/hero-m-900.avif 900w, /hero/hero-m-1200.avif 1200w, /hero/hero-m-1600.avif 1600w, /hero/hero-m-2000.avif 2000w"
          />
          <source
            media="(max-width: 900px)"
            type="image/webp"
            sizes={SIZES_MOBILE}
            srcSet="/hero/hero-m-640.webp 640w, /hero/hero-m-900.webp 900w, /hero/hero-m-1200.webp 1200w, /hero/hero-m-1600.webp 1600w, /hero/hero-m-2000.webp 2000w"
          />
          <source
            media="(max-width: 900px)"
            type="image/jpeg"
            sizes={SIZES_MOBILE}
            srcSet="/hero/hero-m-640.jpg 640w, /hero/hero-m-900.jpg 900w, /hero/hero-m-1200.jpg 1200w, /hero/hero-m-1600.jpg 1600w, /hero/hero-m-2000.jpg 2000w"
          />
          <source
            type="image/avif"
            sizes={SIZES_DESKTOP}
            srcSet="/hero/hero-1280.avif 1280w, /hero/hero-1920.avif 1920w, /hero/hero-2560.avif 2560w, /hero/hero-3200.avif 3200w"
          />
          <source
            type="image/webp"
            sizes={SIZES_DESKTOP}
            srcSet="/hero/hero-1280.webp 1280w, /hero/hero-1920.webp 1920w, /hero/hero-2560.webp 2560w, /hero/hero-3200.webp 3200w"
          />
          <img
            src="/hero/hero-1920.jpg"
            srcSet="/hero/hero-1280.jpg 1280w, /hero/hero-1920.jpg 1920w, /hero/hero-2560.jpg 2560w, /hero/hero-3200.jpg 3200w"
            sizes={SIZES_DESKTOP}
            alt="A Falcon 9 lifting off as a lone figure watches from the pad road"
            className="hero-img"
            fetchPriority="high"
            // async, not sync. These crops decode to 2000x3552 (mobile) and
            // 3200x1800 (desktop); a synchronous AVIF decode at that size
            // blocks the main thread for a beat, and it lands exactly when the
            // user starts scrolling — a freeze at the top of the pan. The
            // placeholder already covers the gap, and fetchPriority still puts
            // the download first, so async costs nothing here.
            decoding="async"
            // The pin's spacer height depends on the laid-out stage, so
            // recompute once the image has settled.
            onLoad={() => ScrollTrigger.refresh()}
          />
        </picture>
      </div>

      <HeroText scrollLength={endValue} />
    </section>
  );
}
