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

    // Touch devices already have hardware-driven momentum scrolling that runs
    // off the main thread. Layering Lenis on top buys nothing visually and
    // moves every scroll frame back onto the main thread, where it competes
    // with the scrubbed card animations. Anchor scrolling falls back to the
    // native smooth behaviour below.
    if (window.matchMedia("(pointer: coarse)").matches) {
      const onNativeScrollTo = (e: Event) => {
        const { target } = (e as CustomEvent<{ target: string }>).detail ?? {};
        const el = target && document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      window.addEventListener("lenis:scroll-to", onNativeScrollTo);
      return () =>
        window.removeEventListener("lenis:scroll-to", onNativeScrollTo);
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
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
