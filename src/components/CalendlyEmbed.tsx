"use client";

import { useEffect, useRef } from "react";
import { CTA } from "@/lib/site";

const WIDGET_SRC = "https://assets.calendly.com/assets/external/widget.js";

/**
 * Inline Calendly booking widget. Calendly's script scans for
 * `.calendly-inline-widget` on load, so on a client-side route change the
 * script is already cached and won't re-scan — we call initInlineWidget()
 * ourselves once it's ready to cover both cases.
 */
declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: {
        url: string;
        parentElement: HTMLElement;
      }) => void;
    };
  }
}

export default function CalendlyEmbed() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const mount = () => {
      if (!window.Calendly || host.childElementCount > 0) return;
      window.Calendly.initInlineWidget({
        url: CTA.calendlyUrl,
        parentElement: host,
      });
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${WIDGET_SRC}"]`
    );
    if (existing) {
      mount();
      existing.addEventListener("load", mount);
      return () => existing.removeEventListener("load", mount);
    }

    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    script.addEventListener("load", mount);
    document.body.appendChild(script);
    return () => script.removeEventListener("load", mount);
  }, []);

  return <div className="cta-calendly" ref={hostRef} />;
}
