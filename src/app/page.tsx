import Hero from "@/components/Hero";
import Portfolio from "@/components/Portfolio";
import CallToAction from "@/components/CallToAction";
import NamesYouKnow from "@/components/NamesYouKnow";
import ClientLogos from "@/components/ClientLogos";
import BrandMark from "@/components/BrandMark";
import BookCallButton from "@/components/BookCallButton";

export default function Home() {
  return (
    <main>
      {/* <div className="site-header">
        <BrandMark />
        <BookCallButton />
      </div> */}
      <Hero />
      <NamesYouKnow />
      <Portfolio />
      <CallToAction />
    </main>
  );
}
