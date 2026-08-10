"use client";

import { CTA } from "@/lib/site";
import CalendlyEmbed from "./CalendlyEmbed";
import SocialLinks from "./SocialLinks";

export default function CallToAction() {
  return (
    <div id="contact" className="cta-section">
      <div className="cta-inner">
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
