"use client";

import { useLayoutEffect, useRef, Fragment } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrubFor } from "@/lib/hero-scroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * Splits a string into per-character spans for the blur-resolve stagger.
 * Characters are grouped into word wrappers, otherwise the inline-blocks
 * let the line break in the middle of a word.
 */
function Chars({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((tok, i) =>
        /^\s+$/.test(tok) ? (
          // Gaps are a plain text node, NOT a .hero-char span. As a span they
          // inherited `display: inline-block; white-space: pre`, which makes
          // each space a rigid box that cannot collapse at a line break — so
          // in the narrow mobile column a space could wrap onto a line of its
          // own and leave a blank line mid-headline. A text node breaks and
          // collapses the way normal whitespace does.
          //
          // Nothing is lost by not animating them: a space has nothing to
          // reveal, and dropping them from the stagger only means the
          // per-character delay counts real characters.
          <Fragment key={i}> </Fragment>
        ) : (
          <span key={i} className="hero-char-word">
            {[...tok].map((c, j) => (
              <span key={j} className="hero-char">
                {c}
              </span>
            ))}
          </span>
        ),
      )}
    </>
  );
}

/** Wraps each word in a clipping box so it can slide up from behind an edge. */
function MaskedWords({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="hero-word-mask">
            <span className="hero-word-inner">{w}</span>
          </span>
        </Fragment>
      ))}
    </>
  );
}

/**
 * `scrollLength` is a ScrollTrigger `end` value, and it is a function rather
 * than a string because on touch the hero's pin length is derived from the
 * laid-out image (see panEnd). It must be the SAME value the pan uses — the
 * line-2 reveal is cued to fractions of the scroll range, so a different end
 * here would time the reveal against a range the image is not using.
 */
export default function HeroText({
  scrollLength,
}: {
  scrollLength: string | (() => string);
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Line 1 plays once, on load — it is not tied to scroll position, so it
  // has its own timeline with no ScrollTrigger.
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const ctx = gsap.context(() => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduced) {
        gsap.set("#text-1", { opacity: 1 });
        gsap.set("#text-1 .hero-char", {
          opacity: 1,
          filter: "blur(0px)",
          yPercent: 0,
        });
        return;
      }

      gsap
        .timeline({
          delay: 0.35,
          // Promote for the tween only, then hand the layers back. Left
          // standing in CSS this was ~30 permanent compositing layers sitting
          // inside the pinned stage, taxing every scrolled frame to accelerate
          // an animation that is already over.
          onComplete: () =>
            gsap.set("#text-1 .hero-char", { willChange: "auto" }),
        })
        .set("#text-1", { opacity: 1 })
        .fromTo(
          "#text-1 .hero-char",
          { opacity: 0, filter: "blur(12px)", yPercent: 40 },
          {
            opacity: 1,
            filter: "blur(0px)",
            yPercent: 0,
            duration: 0.9,
            ease: "power2.out",
            stagger: 0.018,
            willChange: "transform, filter, opacity",
          },
        );
    }, overlay);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    // Walk up rather than take the stage as a prop: React attaches a host
    // element's ref *after* its children's layout effects, so the parent's
    // ref is still null at this point.
    const stage = overlay?.closest("section");
    if (!stage || !overlay) return;

    const mm = gsap.matchMedia(overlay);

    // Line 2 is cued to the figure appearing, and he crosses the frame edge
    // at a different point in the scroll on each crop: late in the wide
    // desktop pan, much earlier in the tall mobile one.
    // `pad` pins the timeline's total length, which is what makes startAt and
    // duration readable as fractions of the scroll range: scrub maps
    // [0..totalDuration] onto the whole trigger, so without it the numbers are
    // relative to whatever the last tween happens to end at. Desktop omits it
    // and keeps its original implicit length.
    const build =
      (
        startAt: number,
        duration: number,
        stagger: number,
        wipeFill: boolean,
        pad?: number,
      ) =>
      () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: scrollLength,
            scrub: scrubFor(),
          },
        });

        tl.set("#text-2", { opacity: 1 }, startAt).fromTo(
          "#text-2 .hero-word-inner",
          { yPercent: 115 },
          { yPercent: 0, duration, ease: "power3.out", stagger },
          startAt,
        );

        // Same empty-white-block fix as line 1 — mobile only.
        if (wipeFill) {
          tl.fromTo(
            "#text-2 .regular-word",
            { backgroundSize: "0% 100%" },
            { backgroundSize: "200% 100%", duration, ease: "power2.out" },
            startAt + stagger,
          );
        }

        // An inert tween spanning 0..pad fixes the timeline's total length, so
        // the reveal above occupies only its real slice of the scroll instead
        // of being stretched across all of it. A real tween rather than a
        // zero-duration marker, so the duration is explicit either way.
        if (pad) tl.to({}, { duration: pad }, 0);

        // No fade-out: line 2 holds at full opacity through the end of the
        // pin, so it stays readable while the image reveal lands.
      };

    mm.add("(min-width: 901px)", build(0.1, 0.16, 0.03, false));

    // Mobile is cued to the scroll-down arrow leaving. That arrow hides at
    // window.scrollY > 80 (Chrome.tsx), and the pin runs +=200% — two
    // viewports — so on an 844px-tall phone it is gone by 80/1688 = 4.7% of
    // the scroll. Starting at 0.05 of a padded 1.0 timeline puts the reveal
    // right behind it, landing by ~15% rather than trailing to the end.
    // wipeFill is on because the filled pill is otherwise an empty white
    // block while the words are still hidden behind their masks.
    // pad only takes effect while it is LARGER than the animation's end
    // (startAt + stagger*2 + duration = 2.54 here). At the old pad of 1 it
    // was ignored, the timeline took its length from the tweens, and the
    // fill was still growing as the pin released. At 4 the reveal occupies
    // its own slice and then parks:
    //   starts 23%  |  white fill complete 63%  |  held 63% -> 100%
    mm.add("(max-width: 900px)", build(0.9, 1.6, 0.02, true, 4));

    return () => mm.revert();
  }, [scrollLength]);

  // Each word unfills only itself, so the effect is a plain :hover in CSS —
  // no JS class toggling needed.

  return (
    <div ref={overlayRef} className="content-overlay">
      {/* Two explicit blocks rather than one run of text left to wrap. The
          break after the boxed word is part of the composition — the second
          line is deliberately smaller and quieter — so it is structure, not
          something a `max-width` in ch should be guessing at. */}
      <div id="text-1" className="hero-line">
        <span className="hero-line-1">
          {/* Single space: runs of whitespace render as one collapsible gap,
              so the old double space no longer widens anything. The box's own
              padding supplies the breathing room next to it. */}
          <Chars text="Launch " />
          <span className="big-word">
            <Chars text="films" />
          </span>
        </span>
        <span className="hero-line-2">
          <Chars text="& founder videos" />
        </span>
      </div>

      <div id="text-2" className="hero-line">
        <MaskedWords text="for" />{" "}
        <span className="regular-word">
          <MaskedWords text="ambitious" />
        </span>{" "}
        <MaskedWords text="Founders" />
      </div>
    </div>
  );
}
