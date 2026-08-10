"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CLIENT_LOGOS } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

const ITEM_HEIGHT = 150;
const WINDOW_SLOTS = 3;

/**
 * Both layouts loop continuously under a CSS animation, so "which logo is
 * centred" cannot be derived from scroll position — it has to be measured per
 * frame. Desktop travels vertically, mobile horizontally; that axis is the
 * only difference, so they share this.
 *
 * Two things here are not obvious and both fix real bugs:
 *
 *  - The highlight is applied by LOGO INDEX to both copies of that logo, not
 *    to the single nearest element. Each track renders CLIENT_LOGOS twice for
 *    the seamless loop, so at the wrap the element under the centre changes
 *    from clone to original. Highlighting one element meant the class had to
 *    hand off between nodes, and the receiving node re-ran its colour
 *    transition from the inactive state — a visible flash on the first logo.
 *
 *  - The switch needs a dead zone. Two logos are routinely near-equidistant
 *    from the centre, and without a threshold the winner flips back and forth
 *    on the smallest jitter.
 */
function createCenterTracker(opts: {
  /** Clipping viewport. Supplies the centre AND scopes the item query. */
  viewport: HTMLElement;
  itemSelector: string;
  axis: "x" | "y";
  activeClass: string;
}) {
  const { viewport, itemSelector, axis, activeClass } = opts;
  const HYSTERESIS = 14;

  let frame = 0;
  let activeLogo = -1;

  const items = () => viewport.querySelectorAll<HTMLElement>(itemSelector);

  const apply = (list: NodeListOf<HTMLElement>, logo: number) => {
    list.forEach((item, i) => {
      item.classList.toggle(activeClass, i % CLIENT_LOGOS.length === logo);
    });
    activeLogo = logo;
  };

  const centreOf = (r: DOMRect) =>
    axis === "x" ? r.left + r.width / 2 : r.top + r.height / 2;

  const measure = () => {
    const list = items();
    if (list.length) {
      const centre = centreOf(viewport.getBoundingClientRect());

      // Distance per LOGO, taking whichever of its copies is closer.
      const dist = new Array<number>(CLIENT_LOGOS.length).fill(Infinity);
      list.forEach((item, i) => {
        const d = Math.abs(centreOf(item.getBoundingClientRect()) - centre);
        const logo = i % CLIENT_LOGOS.length;
        if (d < dist[logo]) dist[logo] = d;
      });

      let best = 0;
      for (let k = 1; k < dist.length; k++) {
        if (dist[k] < dist[best]) best = k;
      }

      if (
        activeLogo === -1 ||
        (best !== activeLogo && dist[best] < dist[activeLogo] - HYSTERESIS)
      ) {
        apply(list, best);
      }
    }
    frame = requestAnimationFrame(measure);
  };

  return {
    start() {
      if (!frame) frame = requestAnimationFrame(measure);
    },
    stop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      items().forEach((item) => item.classList.remove(activeClass));
      activeLogo = -1;
    },
  };
}

/**
 * Runs a tracker only while its media query matches and the section is on
 * screen. Shared so the two layouts cannot drift apart in their teardown.
 */
function useCenterTracker(
  sectionRef: React.RefObject<HTMLDivElement | null>,
  viewportRef: React.RefObject<HTMLDivElement | null>,
  query: string,
  axis: "x" | "y",
  itemSelector: string,
  activeClass: string,
) {
  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    if (!section || !viewport) return;

    const mq = window.matchMedia(query);
    const tracker = createCenterTracker({
      viewport,
      itemSelector,
      axis,
      activeClass,
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && mq.matches) tracker.start();
        else tracker.stop();
      },
      { threshold: 0 },
    );
    observer.observe(section);

    // Crossing the breakpoint must tear the loop down, otherwise it keeps
    // measuring a display:none element on the other layout.
    const onChange = () => {
      if (!mq.matches) tracker.stop();
    };
    mq.addEventListener("change", onChange);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", onChange);
      tracker.stop();
    };
  }, [sectionRef, viewportRef, query, axis, itemSelector, activeClass]);
}

export default function ClientLogos() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Desktop: the list loops vertically through the clipped window.
  useCenterTracker(
    sectionRef,
    windowRef,
    "(min-width: 901px)",
    "y",
    ".client-logo",
    "active",
  );
  // Mobile: horizontal marquee. Behaviour unchanged.
  useCenterTracker(
    sectionRef,
    marqueeRef,
    "(max-width: 900px)",
    "x",
    ".client-logos-marquee-img",
    "is-centered",
  );

  // The heading still reveals on scroll — only the logo list was moved off
  // scroll position onto its own timer.
  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    if (!section || !heading) return;

    const ctx = gsap.context(() => {
      const words = heading.querySelectorAll("[data-word]");
      gsap.set(words, { opacity: 0, y: 16 });
      gsap.to(words, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <div
      id="client-logos-section"
      className="client-logos-section"
      ref={sectionRef}
    >
      <div className="client-logos-sticky">
        <div className="client-logos-heading" ref={headingRef}>
          <h2 className="client-logos-title">
            <span className="client-logos-line" data-word>
              Trusted by
            </span>
            <span className="client-logos-line" data-word>
              {/* <i className="client-logos-script">t</i> */}
              <strong>Teams</strong> at
            </span>
          </h2>
        </div>

        <div
          className="client-logos-window"
          ref={windowRef}
          style={{ height: ITEM_HEIGHT * WINDOW_SLOTS }}
        >
          {/* Duplicated for the seamless vertical loop, exactly like the
              mobile marquee. Rows are a fixed ITEM_HEIGHT with no gap between
              them, so half the list is precisely one copy and
              translateY(-50%) wraps with no seam — the half-gap error that
              had to be worked around on the horizontal track cannot occur
              here. `top` offsets the list so a row sits centred in the
              window rather than flush with its top edge. */}
          <div
            className="client-logos-list"
            style={{ top: (ITEM_HEIGHT * (WINDOW_SLOTS - 1)) / 2 }}
          >
            {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((logo, i) => (
              <div
                // is-wordmark marks the assets that are not yet icon-only.
                // A wordmark cannot go in the square icon box — at 6.3:1 it
                // would render a few pixels tall — so it keeps the cap-height
                // treatment until an icon-only SVG replaces it.
                //
                // No `active` here: the tracker applies it per frame to both
                // copies of whichever logo is centred.
                className={`client-logo${logo.nameInLogo ? " is-wordmark" : ""}`}
                style={{ height: ITEM_HEIGHT }}
                aria-hidden={i >= CLIENT_LOGOS.length ? true : undefined}
                key={`${logo.key}-${i}`}
              >
                {/* The mark sits in a fixed-size cell rather than being
                    allowed to size itself, so every logo occupies the same
                    box and the column lines up down the list. */}
                <span
                  className="client-logo-icon"
                  style={{ "--logo-scale": logo.scale ?? 1 } as CSSProperties}
                >
                  {/* Invisible sizer: a masked element has no intrinsic size,
                      so the real <img> supplies the aspect ratio the mask is
                      painted into. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="client-logo-sizer"
                    src={logo.src}
                    alt=""
                    aria-hidden="true"
                  />
                  {/* aria-hidden: the name below carries the label, so
                      labelling the mark too would announce it twice. */}
                  <span
                    className="client-logo-mark"
                    aria-hidden="true"
                    style={{
                      maskImage: `url(${logo.src})`,
                      WebkitMaskImage: `url(${logo.src})`,
                    }}
                  />
                </span>

                {/* Always rendered, so the name reaches assistive tech even
                    when the artwork already shows it — visually hidden in
                    that case rather than omitted. */}
                <span
                  className={
                    logo.nameInLogo ? "sr-only" : "client-logo-name"
                  }
                >
                  {logo.name}
                </span>

                {logo.batch ? (
                  <span className="client-logo-batch">{logo.batch}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile fallback — infinite auto-scrolling marquee instead of
            the scroll-linked sticky stepper. */}
        <div className="client-logos-marquee" ref={marqueeRef}>
          <div className="client-logos-marquee-track">
            {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((logo, i) => (
              <div
                className={`client-logos-marquee-img${
                  logo.nameInLogo ? " is-wordmark" : ""
                }`}
                key={`${logo.key}-${i}`}
              >
                <span
                  className="client-logos-marquee-icon"
                  style={{ "--logo-scale": logo.scale ?? 1 } as CSSProperties}
                >
                  {/* Invisible sizer. A masked element has no intrinsic
                      size, so the real <img> supplies each logo's aspect
                      ratio and the mask paints over it. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="client-logos-marquee-sizer"
                    src={logo.src}
                    alt=""
                    aria-hidden="true"
                  />
                  <span
                    className="client-logos-marquee-mark"
                    aria-hidden="true"
                    style={{
                      maskImage: `url(${logo.src})`,
                      WebkitMaskImage: `url(${logo.src})`,
                    }}
                  />
                </span>

                {/* The track is duplicated for the seamless loop, so every
                    logo appears twice. Only the first copy is exposed to
                    assistive tech; the clone is inert. */}
                <span
                  className={
                    logo.nameInLogo
                      ? "sr-only"
                      : "client-logos-marquee-text"
                  }
                  aria-hidden={i >= CLIENT_LOGOS.length ? true : undefined}
                >
                  {logo.name}
                </span>

                {logo.batch ? (
                  <span
                    className="client-logos-marquee-batch"
                    aria-hidden={i >= CLIENT_LOGOS.length ? true : undefined}
                  >
                    {logo.batch}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
