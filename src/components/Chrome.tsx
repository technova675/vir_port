"use client";

import { useEffect, useState } from "react";
import { SCROLL_SECTIONS } from "@/lib/site";
import { scrollToSelector } from "./SmoothScroll";

export default function Chrome() {
  const [scrolled, setScrolled] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setPct(Math.round(p * 100));
      setScrolled(window.scrollY > 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="ui-gradient-top" />
      <div className="ui-gradient-bottom" />

      {/* eslint-disable-next-line @next/next/no-img-element 
      <img
        id="logo"
        src="/logo.png"
        alt="Logo"
        className={scrolled ? "shrunk" : undefined}
        onClick={() => scrollToSelector("body")}
      />*/}
      <nav className={`scroll-nav${scrolled ? " visible" : ""}`}>
        {SCROLL_SECTIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={s.label}
            className={`scroll-nav-item${i === 0 && !scrolled ? " active" : ""}`}
            onClick={() => scrollToSelector(`#${s.id}`)}
          >
            —
          </button>
        ))}
        <div className="scroll-progress-indicator">{pct}%</div>
      </nav>

      <div
        className="scroll-arrows"
        style={{
          opacity: scrolled ? 0 : 1,
          transform: scrolled ? "translateY(20px)" : "none",
        }}
      >
        <div className="scroll-arrow" />
        <div className="scroll-arrow" />
        <div className="scroll-arrow" />
      </div>
    </>
  );
}
