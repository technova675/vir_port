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

    // Touch devices get NO Lenis at all.
    //
    // This previously ran Lenis with syncTouch, which intercepts touch and
    // drives the page from a main-thread RAF loop. The stated goal was to let
    // the scrubbed hero pan track the finger exactly. On real phones it costs
    // more than it buys: native touch scrolling is handled by the compositor,
    // on its own thread, at display refresh rate, and no main-thread loop can
    // match that. Taking it over produces judder AND — because Lenis eases
    // toward its target — a pan that trails the finger. Both symptoms at once,
    // on iOS Safari and Android Chrome.
    //
    // So: native momentum on touch, paired with an instant scrub (see
    // scrubFor) so the pan follows that momentum with no added latency.
    // Lenis stays on for pointer/wheel devices, where there is no compositor
    // momentum to preserve and it is a genuine improvement.
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    if (coarse) {
      // ScrollTrigger falls back to its own native scroll listener, which is
      // what we want here. Nothing to set up and nothing to tear down.
      return;
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

/**
 * Helper so any component can request a smooth anchor scroll.
 *
 * The event above is only listened for when Lenis is running, which is now
 * pointer devices only — on touch the event would go nowhere and every nav
 * link would silently do nothing. `scrollTo` with `behavior: "smooth"` is the
 * native equivalent and is supported by every browser this site targets,
 * including iOS Safari.
 */
export function scrollToSelector(selector: string) {
  const lenisActive = document.documentElement.classList.contains("lenis");

  if (lenisActive) {
    window.dispatchEvent(
      new CustomEvent("lenis:scroll-to", { detail: { target: selector } }),
    );
    return;
  }

  const el = document.querySelector(selector);
  if (!el) return;

  // Respect the same preference the smooth-scroll effect checks, so an
  // anchor jump is not the one animation that ignores it.
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}
