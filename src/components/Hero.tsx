"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FrameSequence } from "@/lib/frameSequence";
import { FRAMES } from "@/lib/site";
import Preloader from "./Preloader";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  /* ---------------- frame sequence -> canvas ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const spacer = spacerRef.current;
    if (!canvas || !spacer) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const seq = new FrameSequence((loaded, total) =>
      setProgress(loaded / total),
    );

    // Scroll progress -> frame index. Kept in a plain object so the
    // ScrollTrigger callback stays allocation-free.
    const state = { frame: 0 };
    let lastPainted = -1;
    let rafId = 0;

    const paint = () => {
      const target = Math.round(state.frame);
      if (target !== lastPainted) {
        const img = seq.nearest(target);
        if (img) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          lastPainted = target;
        }
      }
      rafId = requestAnimationFrame(paint);
    };

    let trigger: ScrollTrigger | undefined;

    seq.start().then(() => {
      setReady(true);
      lastPainted = -1;
      rafId = requestAnimationFrame(paint);

      trigger = ScrollTrigger.create({
        trigger: spacer,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          state.frame = self.progress * (seq.total - 1);
        },
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      trigger?.kill();
      seq.dispose();
    };
  }, []);

  /* ---------------- hero text timeline ---------------- */
  useEffect(() => {
    if (!ready) return;
    const spacer = spacerRef.current;
    if (!spacer) return;

    const ctx = gsap.context(() => {
      gsap.set("#text-2", { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: spacer,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });

      // Line one appears, then line two joins it below — both held
      // together — then only line one leaves, line two stays in place.
      tl.to("#text-1", { opacity: 1, duration: 0.2 })
        .to("#text-2", { opacity: 1, duration: 0.2 }, 0.15)
        .to("#text-1", { opacity: 0, y: -40, duration: 0.2 }, 0.5)
        .to("#text-2", { opacity: 0, y: -40, duration: 0.15 }, 0.85);
    }, rootRef);

    return () => ctx.revert();
  }, [ready]);

  /* ---------------- display-word hover wipes ---------------- */
  useEffect(() => {
    const big = document.querySelector<HTMLElement>(".big-word");
    const regular = document.querySelector<HTMLElement>(".regular-word");

    const bigEnter = () => big?.classList.add("unfilled");
    const bigLeave = () => big?.classList.remove("unfilled");
    const regEnter = () => regular?.classList.add("filled");
    const regLeave = () => regular?.classList.remove("filled");

    big?.addEventListener("mouseenter", bigEnter);
    big?.addEventListener("mouseleave", bigLeave);
    regular?.addEventListener("mouseenter", regEnter);
    regular?.addEventListener("mouseleave", regLeave);

    return () => {
      big?.removeEventListener("mouseenter", bigEnter);
      big?.removeEventListener("mouseleave", bigLeave);
      regular?.removeEventListener("mouseenter", regEnter);
      regular?.removeEventListener("mouseleave", regLeave);
    };
  }, [ready]);

  return (
    <div ref={rootRef}>
      <Preloader progress={progress} ready={ready} />

      <div id="video-container">
        <canvas id="image-canvas" ref={canvasRef} width={1920} height={1080} />
      </div>

      <div className="content-overlay" id="combined-text-overlay">
        <div className="combined-text-wrapper">
          <div className="text-section" id="text-1">
            <div className="text-gradient-bg" />
            <div className="we-tell">We tell</div>
            <div className="text-1-line">
              <span className="big-word">BIG</span>
              <span className="stories-word">stories</span>
            </div>
          </div>

          <div className="text-section" id="text-2">
            <div className="text-gradient-bg" />
            <div className="text-2-line">
              <span className="for-word">for</span>
              <span className="regular-word" id="regular-word-trigger">
                REGULAR
              </span>
            </div>
            <div className="sized-people-word">sized people</div>
          </div>
        </div>
      </div>

      <div id="spacer" ref={spacerRef} style={{ height: `${FRAMES.scrollVh}vh` }} />
    </div>
  );
}
