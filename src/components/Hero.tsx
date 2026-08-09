"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroText from "./HeroText";

gsap.registerPlugin(ScrollTrigger);

/** Scroll distance the pan is spread across, as a % of viewport height. */
const SCROLL_LENGTH = "+=200%";

export default function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

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
          end: SCROLL_LENGTH,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, stage);

    return () => ctx.revert();
  }, []);

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
        {/* <picture>, not next/image: the crops have different aspect ratios
            (1672x941 landscape vs 941x1672 portrait) and this swaps them with
            a single download. Two <Image>s would fetch both. */}
        <picture>
          <source
            media="(max-width: 900px)"
            srcSet="/hero_mobile_1.png"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero_section.png"
            alt="A Falcon 9 lifting off as a lone figure watches from the pad road"
            className="hero-img"
            fetchPriority="high"
            decoding="async"
            // The pin's spacer height depends on the laid-out stage, so
            // recompute once the image has settled.
            onLoad={() => ScrollTrigger.refresh()}
          />
        </picture>
      </div>

      <HeroText scrollLength={SCROLL_LENGTH} />
    </section>
  );
}
