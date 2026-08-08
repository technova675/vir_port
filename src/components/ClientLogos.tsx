"use client";

import { useEffect, useRef, useState } from "react";
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
    let current: HTMLElement | null = null;

    const measure = () => {
      const box = marquee.getBoundingClientRect();
      const centerX = box.left + box.width / 2;
      const items =
        marquee.querySelectorAll<HTMLElement>(".client-logos-marquee-img");

      let nearest: HTMLElement | null = null;
      let nearestDist = Infinity;
      for (const item of items) {
        const r = item.getBoundingClientRect();
        const dist = Math.abs(r.left + r.width / 2 - centerX);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = item;
        }
      }

      if (nearest !== current) {
        current?.classList.remove("is-centered");
        nearest?.classList.add("is-centered");
        current = nearest;
      }
      frame = requestAnimationFrame(measure);
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      current?.classList.remove("is-centered");
      current = null;
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
                className={`client-logo${i === activeIndex ? " active" : ""}${
                  logo.text ? " with-text" : ""
                }`}
                style={{ height: ITEM_HEIGHT }}
                key={logo.key}
              >
                <div
                  className="client-logo-mark"
                  style={{
                    maskImage: `url(${logo.src})`,
                    WebkitMaskImage: `url(${logo.src})`,
                  }}
                  role="img"
                  aria-label={logo.alt}
                />
                {logo.text ? (
                  <span className="client-logo-text">{logo.text}</span>
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
              <div className="client-logos-marquee-img" key={`${logo.key}-${i}`}>
                <span className="client-logos-marquee-icon">
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
                    style={{
                      maskImage: `url(${logo.src})`,
                      WebkitMaskImage: `url(${logo.src})`,
                    }}
                    role="img"
                    aria-label={logo.alt}
                  />
                </span>
                {/* Some assets are icon-only and carry the brand name as
                    `text` — without this they render as a bare glyph here
                    while desktop shows icon + wordmark. */}
                {logo.text ? (
                  <span className="client-logos-marquee-text">{logo.text}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
