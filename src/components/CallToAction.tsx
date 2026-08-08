"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CTA } from "@/lib/site";
import CalendlyEmbed from "./CalendlyEmbed";
import SocialLinks from "./SocialLinks";

export default function CallToAction() {
  const innerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const lastX = useRef(0);

  useEffect(() => {
    const inner = innerRef.current;
    const button = buttonRef.current;
    if (!inner || !button) return;

    const quickX = gsap.quickTo(button, "x", { duration: 0.5, ease: "power3" });
    const quickY = gsap.quickTo(button, "y", { duration: 0.5, ease: "power3" });
    // GSAP's own transform prop is "rotation" — "rotate" hits the CSS
    // shorthand path and warns that it can't be reset individually.
    const quickRotate = gsap.quickTo(button, "rotation", {
      duration: 0.5,
      ease: "power3",
    });

    const onMove = (e: MouseEvent) => {
      const rect = inner.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;

      quickX(x);
      quickY(y);
      quickRotate(gsap.utils.clamp(-12, 12, dx * 0.8));
    };

    inner.addEventListener("mousemove", onMove);
    return () => inner.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div id="contact" className="cta-section">
      <div className="cta-inner" ref={innerRef}>
        <h2 className="cta-heading">
          <span className="cta-word">Say</span>
          <span className="cta-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="cta-image" src={CTA.image} alt={CTA.imageAlt} />
          </span>
          <span className="cta-word">
            <i className="cta-script">H</i>ello
          </span>
        </h2>

        
        <p className="cta-subtext">{CTA.subtext}</p>

        <div className="cta-booking">
          <h3 className="cta-booking-heading">{CTA.bookingHeading}</h3>
          <p className="cta-booking-subtext">{CTA.bookingSubtext}</p>
          <CalendlyEmbed />

          <div className="cta-socials">
            <p className="cta-socials-label">Follow along</p>
            <SocialLinks />
          </div>
        </div>
      </div>
    </div>
  );
}
