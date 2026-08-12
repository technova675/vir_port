"use client";

import { CTA } from "@/lib/site";
import CalendlyEmbed from "./CalendlyEmbed";
import SocialLinks from "./SocialLinks";

export default function CallToAction() {
  return (
    <div id="contact" className="cta-section">
      <div className="cta-inner">

        <div className="cta-booking">
          <h3 className="cta-booking-heading">{CTA.bookingHeading}</h3>
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
