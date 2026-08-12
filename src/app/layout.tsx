import type { Metadata } from "next";
import {
  Inter,
  Chakra_Petch,
  Major_Mono_Display,
  Archivo,
  Archivo_Black,
} from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const majorMono = Major_Mono_Display({
  variable: "--font-major-mono",
  subsets: ["latin"],
  weight: ["400"],
});

// Hero only. Variable font: the `wdth` axis is what gives the Expanded cut.
const archivo = Archivo({
  variable: "--font-hero-display",
  subsets: ["latin"],
  axes: ["wdth"],
});

// Hero line 1. A separate static family from `archivo` above, not a weight of
// it — Archivo Black is its own cut, and its letterforms are heavier than the
// variable family reaches at 700.
const archivoBlack = Archivo_Black({
  variable: "--font-hero-black",
  subsets: ["latin"],
  weight: "400",
});

const neueBrucke = localFont({
  src: "../fonts/NeueBrucke-Regular.ttf",
  variable: "--font-neue-brucke",
  weight: "400",
});

const nbInternational = localFont({
  src: "../fonts/NBInternational-Regular.ttf",
  variable: "--font-nb-international",
  weight: "400",
});

const p22Parrish = localFont({
  src: "../fonts/P22ParrishRoman.ttf",
  variable: "--font-p22-parrish",
  weight: "400",
});

const aeonik = localFont({
  src: [
    { path: "../fonts/aeonik-light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/aeonik-regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/aeonik-medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/aeonik-bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-aeonik",
});

const workhorse = localFont({
  src: "../fonts/WorkhorseScriptTest-Display.woff2",
  variable: "--font-workhorse",
  weight: "400",
});

const geist = localFont({
  src: [
    {
      path: "../fonts/geist/Geist-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/geist/Geist-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/geist/Geist-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/geist/Geist-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-geist",
});

const aspekta = localFont({
  src: "../fonts/geist/Aspekta-Variable.woff2",
  variable: "--font-aspekta",
  weight: "100 900",
});

const interLocal = localFont({
  src: "../fonts/geist/Inter-Regular.woff2",
  variable: "--font-inter-local",
  weight: "400",
});

// Context.dev's own wordmark, matched from their site: IBM Plex Sans
// Medium (font-family: "IBM Plex Sans", font-weight: 500).
const ibmPlexSansMedium = localFont({
  src: "../fonts/context-dev/IBMPlexSans-Medium.ttf",
  variable: "--font-ibm-plex-context",
  weight: "500",
});

export const metadata: Metadata = {
  title: "VIR — Builder / storyteller ",
  description: "We tell big stories for regular sized people.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: browser extensions inject attributes onto
    // <html> before React hydrates (e.g. __gcrremoteframetoken), which
    // React reports as a mismatch. This suppresses attribute diffing for
    // this element only — it does NOT cascade to children, so real
    // mismatches inside the app are still reported.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${chakra.variable} ${majorMono.variable} ${archivo.variable} ${archivoBlack.variable} ${neueBrucke.variable} ${nbInternational.variable} ${p22Parrish.variable} ${aeonik.variable} ${workhorse.variable} ${geist.variable} ${aspekta.variable} ${interLocal.variable} ${ibmPlexSansMedium.variable} antialiased`}
    >
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
