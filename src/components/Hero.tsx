import Image from "next/image";
import NamesYouKnow from "./NamesYouKnow";

export default function Hero() {
  return (
    <section className="matter-hero" aria-labelledby="matter-hero-title">
      <div className="matter-hero-frame" aria-hidden="true">
        <span className="matter-hero-rule matter-hero-rule--top" />
        <span className="matter-hero-rule matter-hero-rule--left" />
        <span className="matter-hero-rule matter-hero-rule--right" />
      </div>
      <div className="matter-hero-card">
        <div className="matter-hero-copy">
          <p className="matter-hero-badge">
            Trusted by{" "}
            <Image
              className="matter-hero-badge-combinator"
              src="/YC_LOGO.png"
              alt="Combinator"
              width={100}
              height={30}
            />{" "}
            companies
          </p>
          <h1 id="matter-hero-title">
            We make videos
            <br />
            the internet
            <br />
            loves
          </h1>
          <span className="matter-hero-slashes" aria-hidden="true">
            ///
          </span>
          <p className="matter-hero-intro">
            We create launch films, founder stories, and social content people
            actually want to watch.
          </p>
          <div className="matter-hero-services" aria-label="Services">
            <span>launch film</span>
            <span className="matter-hero-services-slash" aria-hidden="true">
              /
            </span>
            <span>Product Videos</span>
            <span className="matter-hero-services-slash" aria-hidden="true">
              /
            </span>
            <span>Founder Videos</span>
          </div>
        </div>
        <span className="matter-hero-dot matter-hero-dot--tl" />
        <span className="matter-hero-dot matter-hero-dot--tr" />
        <span className="matter-hero-dot matter-hero-dot--bl" />
        <span className="matter-hero-dot matter-hero-dot--br" />
      </div>
    </section>
  );
}
