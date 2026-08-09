"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis drives its own RAF loop, so ScrollTrigger must be told to read
 * from it rather than native scroll events — otherwise every scrubbed
 * animation lags a frame or two behind the actual scroll position.
 */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Without syncTouch, a touch device scrolls with hardware momentum that
    // runs off the main thread — the browser moves the page, then tells JS
    // about it afterwards. Anything scrubbed to scroll position (the hero
    // pan) therefore arrives a frame or more late, which reads as lag and
    // stepping. syncTouch hands touch scrolling to Lenis' own RAF loop, the
    // same one ScrollTrigger already reads from, so the pan tracks the
    // finger. The trade is that scrolling is now main-thread work.
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: coarse,
      // Native touch scrolling travels further per swipe than Lenis' 1:1
      // default, so without this the page feels heavy once syncTouch is on.
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Let other components trigger anchor scrolling through Lenis.
    const onScrollTo = (e: Event) => {
      const { target } = (e as CustomEvent<{ target: string }>).detail ?? {};
      if (!target) return;
      const el = document.querySelector(target);
      if (el) lenis.scrollTo(el as HTMLElement, { offset: 0 });
    };
    window.addEventListener("lenis:scroll-to", onScrollTo);

    return () => {
      window.removeEventListener("lenis:scroll-to", onScrollTo);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

/** Helper so any component can request a smooth anchor scroll. */
export function scrollToSelector(selector: string) {
  window.dispatchEvent(
    new CustomEvent("lenis:scroll-to", { detail: { target: selector } }),
  );
}
