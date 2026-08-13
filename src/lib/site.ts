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
  /** Accelerator batch the client was in, e.g. "YC S26". Stamped top-right
      on the card, opposite the index. */
  batch: item.batch,
  /** Live post the film shipped in — the proof, not a dead internal route. */
  exploreHref: item.url,
}));

export type ClientLogo = {
  key: string;
  /** SVG in public/logos. Rendered as a CSS mask so it can be recoloured. */
  src: string;
  /**
   * Company name. Always set, because it is the accessible label whether or
   * not it is shown — when the artwork already spells the name, this is
   * rendered for screen readers only.
   */
  name: string;
  /**
   * True when `src` is a wordmark that already contains the company name, so
   * printing `name` next to it would say it twice.
   *
   * This used to be implicit: the old `text` field held "Tsenta YC (S26)" for
   * icon assets but just "YC (S26)" for wordmark ones, and the rule for which
   * was which existed only in the author's head. Anyone adding a logo had no
   * way to know. Now it is stated per entry.
   *
   * The target state is icon-only artwork everywhere, at which point this is
   * false for every entry and every row is [mark] [name] [batch].
   */
  nameInLogo?: boolean;
  /** Accelerator batch. Its own field, and its own chip — never concatenated
      into the name, which is what made rows different widths. */
  batch?: string;
  /**
   * Optical size nudge, 1 = untouched. A uniform box is not the same as
   * uniform *apparent* size: every SVG carries different padding inside its
   * viewBox, so some need a hand tweak to sit right against the others.
   * There is no automatic rule for this — it is eyeballed once per asset.
   */
  scale?: number;
  /**
   * Desktop-only override for `scale`. The desktop list runs its marks at
   * ~40px and the mobile marquee at 22px, and the padding inside a viewBox
   * does not read the same at both sizes — a nudge that squares up the big
   * list can overshoot in the strip. Falls back to `scale` when unset, so an
   * asset needing one number everywhere still carries only one.
   */
  desktopScale?: number;
};

export const CLIENT_LOGOS: readonly ClientLogo[] = [
  { key: "context-dev", src: "/logos/context_dev.svg", name: "Context.dev", batch: "YC S26", nameInLogo: false },
  { key: "tsenta", src: "https://tsenta.com/assets/brand/tsenta-black.png", name: "Tsenta", batch: "YC S26", nameInLogo: false },
  { key: "click", src: "/logos/click.svg", name: "Click", batch: "YC S26", nameInLogo: false },
  { key: "agnost-ai", src: "https://agnost.ai/logos/agnost-ai-horizontal.png", name: "Agnost AI", batch: "YC S26", nameInLogo: true },
  { key: "aptos", src: "/logos/aptos.svg", name: "Aptos", nameInLogo: true },
  { key: "duo", src: "/logos/duo.svg", name: "Duo", nameInLogo: true },
  { key: "starknet", src: "/logos/starknet.svg", name: "StarkNet", nameInLogo: true },
  { key: "agglayer", src: "/logos/agglayer.svg", name: "Agglayer", nameInLogo: true },
  { key: "biconomy", src: "/logos/biconomy.svg", name: "Biconomy", nameInLogo: true },
];


/** Call-to-action section — image + copy. */
export const CTA = {
  image: "/vir.jpeg",
  imageAlt: "Vir",
  bookingHeading: "Book a call",
  bookingSubtext: "Pick a time",
  calendlyUrl:
    "https://calendly.com/thevirofficial/meeting?hide_gdpr_banner=1",
} as const;

export const SITE = {
  email: "vir@thevirofficial.com",
} as const;

export const SOCIALS = [
  { label: "X", href: "https://x.com/Thevirofficial" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/thevirofficial/" },
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
