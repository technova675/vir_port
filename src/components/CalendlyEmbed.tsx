import Script from "next/script";
import { CTA } from "@/lib/site";

/* Calendly inline widget begin */
export default function CalendlyEmbed() {
  return (
    <>
      <div
        className="calendly-inline-widget cta-calendly"
        data-url={CTA.calendlyUrl}
        style={{ minWidth: "320px", height: "700px" }}
      />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </>
  );
}
/* Calendly inline widget end */
