/**
 * Single source of truth for site content.
 */

/**
 * Real portfolio content — one entry per delivered film, sourced from
 * `data.json` at the repo root. Every field on a card is real; nothing here
 * is placeholder copy, and nothing renders unless it has a value.
 */
import PORTFOLIO_ITEMS from "./data.json";

export const FILM_CARDS = PORTFOLIO_ITEMS.map((item, i) => ({
  key: `film-${item.id}`,
  /** Index stamp on the card — "01", "02", … */
  index: String(i + 1).padStart(2, "0"),
  image: item.image,
  video: item.video,
  title: item.client,
  eyebrow: item.category,
  /** Live post the film shipped in — the proof, not a dead internal route. */
  exploreHref: item.url,
}));

/** Client logo SVGs, served locally from public/logos. */
export const CLIENT_LOGOS = [
  { key: "context-dev", src: "/logos/context_dev.svg", text: "Context.dev YC (S26)", alt: "Context.dev" },
  { key: "agnost-ai", src: "/logos/agnost-ai-horizontal.svg", text: "YC (S26)", alt: "Agnost AI" },
  { key: "tsenta", src: "/logos/tsenta-black.svg", text: "Tsenta YC (S26)", alt: "Tsenta" },
  { key: "click", src: "/logos/click.svg", text: "Click YC (S26)", alt: "Click" },
  { key: "duo", src: "/logos/duo.svg", text: "", alt: "Duo" },
  { key: "agglayer", src: "/logos/agglayer.svg", text: "", alt: "Agglayer" },
  { key: "aptos", src: "/logos/aptos.svg", text: "", alt: "Aptos" },
  { key: "biconomy", src: "/logos/biconomy.svg", text: "", alt: "Biconomy" },
] as const;

/** Call-to-action section — image + copy. */
export const CTA = {
  image: "/vir.jpeg",
  imageAlt: "Vir",
  bookingHeading: "Book a call",
  bookingSubtext: "Pick a time",
  /**
   * Query params style the widget to match the dark section —
   * hex values, no leading "#".
   */
  calendlyUrl:
    "https://calendly.com/thevirofficial/meeting" +
    "?hide_gdpr_banner=1" +
    "&hide_landing_page_details=1" +
    "&background_color=0d0d0d" +
    "&text_color=ffffff" +
    "&primary_color=ff4d8d",
} as const;

export const SITE = {
  email: "vir@thevirofficial.com",
} as const;

export const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/thevirofficial/" },
  { label: "X", href: "https://x.com/Thevirofficial" },
] as const;

/** Right-rail scroll markers — one per major section. */
export const SCROLL_SECTIONS = [
  { id: "text-1", label: "Intro" },
  { id: "reel-scroll-section", label: "Reel" },
  { id: "story-section", label: "About" },
  { id: "story-panels-wrapper", label: "Story" },
  { id: "portfolio-section", label: "Portfolio" },
  { id: "contact", label: "Contact" },
] as const;
