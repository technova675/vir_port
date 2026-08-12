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
    </>
  );
}
