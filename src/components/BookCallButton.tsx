"use client";

import { useEffect, useState } from "react";
import { scrollToSelector } from "./SmoothScroll";

export default function BookCallButton() {
  /* The pill is fixed to the top-right for the whole scroll, but its only job
     is to jump to #contact — so once the CTA itself is arriving there is
     nothing left for it to do, and it would sit on top of the booking heading.
     It fades out as the portfolio ends and comes back if you scroll up.

     The bottom -15% rootMargin shrinks the observation area up from the
     viewport floor, so "intersecting" starts when the CTA's top edge reaches
     roughly 85% down the screen rather than the instant it peeks in. */
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const cta = document.querySelector("#contact");
    if (!cta) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(cta);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      type="button"
      className={`book-call-button${hidden ? " is-hidden" : ""}`}
      /* Faded out is also gone for keyboard and screen readers — an invisible
         button that still takes focus is a trap. */
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      onClick={() => scrollToSelector("#contact")}
    >
      Book a call <span aria-hidden="true">&rarr;</span>
    </button>
  );
}
