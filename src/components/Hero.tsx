import Image from "next/image";
import NamesYouKnow from "./NamesYouKnow";

export default function Hero() {
  return (
    <section className="matter-hero" aria-labelledby="matter-hero-title">
      <span
        className="matter-hero-rule matter-hero-rule--top"
        aria-hidden="true"
      />
      <div className="matter-hero-card">
        <span
          className="matter-hero-rule matter-hero-rule--left"
          aria-hidden="true"
        />
        <span
          className="matter-hero-rule matter-hero-rule--right"
          aria-hidden="true"
        />
        <div className="matter-hero-copy">
          <p className="matter-hero-badge">
            Trusted by{" "}
            <Image
              className="matter-hero-badge-combinator"
              src="https://framerusercontent.com/images/pODjxfbYdMq28sA448CZNeUw4.png?scale-down-to=512&width=3121&height=890"
              alt="Combinator"
              width={100}
              height={30}
            />{" "}
            companies
          </p>
          <h1 id="matter-hero-title">
            We make videos
            <br />
            that internet loves
          </h1>
          <span className="matter-hero-slashes" aria-hidden="true">
            ///
          </span>
          {/* <p className="matter-hero-intro">
            We create launch films, founder stories, and social content people
            actually want to watch.
          </p> */}
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
      </div>
      <span
        className="matter-hero-rule matter-hero-rule--bottom"
        aria-hidden="true"
      />
    </section>
  );
}
