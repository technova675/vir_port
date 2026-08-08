import Chrome from "@/components/Chrome";
import Hero from "@/components/Hero";
import ClientLogos from "@/components/ClientLogos";
import Portfolio from "@/components/Portfolio";
import CallToAction from "@/components/CallToAction";

export default function Home() {
  return (
    <main>
      <Chrome />
      <Hero />

      {/* Placeholder anchors so the nav + scroll rail have targets.
          Kept minimal-height (not h-screen) so there's no dead scroll gap
          before the portfolio — these become real sections later. */}
      <section id="reel-scroll-section" className="relative z-10" />
      <section id="story-section" className="relative z-10" />
      <section id="story-panels-wrapper" className="relative z-10" />
      <Portfolio />
      <ClientLogos />
      <CallToAction />
    </main>
  );
}
