"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CLIENT_LOGOS } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger);

const ITEM_HEIGHT = 150;
const WINDOW_SLOTS = 3;

export default function ClientLogos() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  // Mobile only: the marquee scrolls continuously via CSS, so "which logo
  // is centered" can't be derived from scroll position the way the desktop
  // stepper does it — it has to be measured per frame. The loop is gated
  // behind both a max-width query and an IntersectionObserver, so it never
  // runs on desktop and never runs while the section is off-screen.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const marquee = marqueeRef.current;
    const section = sectionRef.current;
    if (!marquee || !section) return;

    let frame = 0;
    // The index into CLIENT_LOGOS that is currently highlighted — NOT a
    // specific element. See applyActive for why that distinction matters.
    let activeLogo = -1;

    /**
     * Minimum improvement, in px, before the highlight moves to another logo.
     *
     * Without it, two logos sitting almost equidistant from the centre swap
     * the highlight on the slightest jitter — and they routinely are almost
     * equidistant (Context.dev measured ~165px out, Tsenta ~160px). Any nudge
     * flipped it and flipped it back, which read as a flicker.
     */
    const HYSTERESIS = 14;

    /**
     * Applies the highlight to BOTH copies of the chosen logo.
     *
     * The track renders CLIENT_LOGOS twice for the seamless loop, so every
     * logo exists as two separate elements. Highlighting only the one nearest
     * the centre meant that at the wrap — when the clone hands its screen
     * position to the original — the class had to move between two nodes. The
     * receiving node had never been active, so it re-ran the 0.35s colour
     * transition from the inactive white: the same logo visibly dropped out of
     * its fill colour and faded back in. Marking the pair means the incoming
     * node is already in the right state and nothing animates.
     *
     * The twin is eight slots away, so it is never on screen at the same time.
     */
    const applyActive = (items: NodeListOf<HTMLElement>, logo: number) => {
      items.forEach((item, i) => {
        item.classList.toggle("is-centered", i % CLIENT_LOGOS.length === logo);
      });
      activeLogo = logo;
    };

    const measure = () => {
      const box = marquee.getBoundingClientRect();
      const centerX = box.left + box.width / 2;
      const items =
        marquee.querySelectorAll<HTMLElement>(".client-logos-marquee-img");

      if (items.length) {
        // Distance per LOGO, taking whichever of its two copies is closer.
        const dist = new Array<number>(CLIENT_LOGOS.length).fill(Infinity);
        items.forEach((item, i) => {
          const r = item.getBoundingClientRect();
          const d = Math.abs(r.left + r.width / 2 - centerX);
          const logo = i % CLIENT_LOGOS.length;
          if (d < dist[logo]) dist[logo] = d;
        });

        let best = 0;
        for (let k = 1; k < dist.length; k++) {
          if (dist[k] < dist[best]) best = k;
        }

        if (activeLogo === -1) {
          applyActive(items, best);
        } else if (
          best !== activeLogo &&
          dist[best] < dist[activeLogo] - HYSTERESIS
        ) {
          applyActive(items, best);
        }
      }

      frame = requestAnimationFrame(measure);
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      marquee
        .querySelectorAll<HTMLElement>(".client-logos-marquee-img")
        .forEach((item) => item.classList.remove("is-centered"));
      activeLogo = -1;
    };

    const start = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && mq.matches) start();
        else stop();
      },
      { threshold: 0 },
    );
    observer.observe(section);

    // Resizing across the breakpoint must tear the loop down, otherwise it
    // keeps measuring a display:none marquee on desktop.
    const onChange = () => {
      if (!mq.matches) stop();
    };
    mq.addEventListener("change", onChange);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", onChange);
      stop();
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    const list = listRef.current;
    if (!section || !heading || !list) return;

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

      const windowHeight = ITEM_HEIGHT * WINDOW_SLOTS;
      const centerOffset = windowHeight / 2 - ITEM_HEIGHT / 2;
      const lastIndex = CLIENT_LOGOS.length - 1;

      // The logo list continuously slides upward through a small clipped
      // window as you scroll — the item centered in that window (not a
      // discrete "current" item) is the active/recolored one.
      gsap.set(list, { y: centerOffset });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const y = centerOffset - self.progress * lastIndex * ITEM_HEIGHT;
          gsap.set(list, { y });

          const idx = Math.round(self.progress * lastIndex);
          if (idx !== activeIndexRef.current) {
            activeIndexRef.current = idx;
            setActiveIndex(idx);
          }
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
          style={{ height: ITEM_HEIGHT * WINDOW_SLOTS }}
        >
          <div className="client-logos-list" ref={listRef}>
            {CLIENT_LOGOS.map((logo, i) => (
              <div
                // is-wordmark marks the assets that are not yet icon-only.
                // A wordmark cannot go in the square icon box — at 6.3:1 it
                // would render a few pixels tall — so it keeps the cap-height
                // treatment until an icon-only SVG replaces it.
                className={`client-logo${i === activeIndex ? " active" : ""}${
                  logo.nameInLogo ? " is-wordmark" : ""
                }`}
                style={{ height: ITEM_HEIGHT }}
                key={logo.key}
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
