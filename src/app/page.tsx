import Chrome from "@/components/Chrome";
import Hero from "@/components/Hero";
import Portfolio from "@/components/Portfolio";
import CallToAction from "@/components/CallToAction";
import NamesYouKnow from "@/components/NamesYouKnow";
import ClientLogos from "@/components/ClientLogos";

export default function Home() {
  return (
    <main>
      <Chrome />
      <Hero />
      <NamesYouKnow />
      <Portfolio />
      {/* <ClientLogos /> */}
      <CallToAction />
    </main>
  );
}
