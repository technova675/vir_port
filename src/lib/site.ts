/**
 * Single source of truth for content + the hero frame sequence.
 * Swap FRAMES.baseUrl to your own frames when they're ready.
 */

export const FRAMES = {
  /**
   * Served locally from `public/sequence`. The files on disk run
   * sequoia_175.jpg .. sequoia_677.jpg (503 contiguous frames), so `first`
   * is the starting file number — not 1 — because the loader resolves each
   * frame as `first + index`.
   *
   * If you re-export the sequence:
   *   ffmpeg -i source.mp4 -vf "fps=30,scale=1920:-2" -q:v 3 \
   *     public/sequence/sequoia_%03d.jpg
   * then set `first` to the lowest file number and `count` to the number
   * of files produced.
   *
   * Currently the hero is a SINGLE still, not the sequence: `first: 174`
   * + `count: 1` pins it to sequoia_174.jpeg (the launchpad shot). To go
   * back to the scrubbing sequence set `first: 175, count: 503`.
   *
   * That still was dropped in as .jpeg while every sequence frame is .jpg,
   * hence the extension branch below — without it the URL 404s and, because
   * FrameSequence swallows load errors, the canvas just stays black.
   */
  baseUrl: "/sequence",
  pattern: (n: number) =>
    n === 174
      ? "sequoia_174.jpeg"
      : `sequoia_${String(n).padStart(3, "0")}.jpg`,
  first: 174,
  count: 1,
  /** Coarse pass stride — every Nth frame loads before the backfill. */
  stride: 16,
  /** Parallel image requests during backfill. */
  concurrency: 8,
  /** How many viewport-heights the hero scrub lasts. */
  scrollVh: 200,
} as const;

export const frameUrl = (n: number) =>
  `${FRAMES.baseUrl}/${FRAMES.pattern(n)}`;



/**
 * Real portfolio content — one entry per delivered film, sourced from
 * `data.json` at the repo root. Every field on a card is real; nothing here
 * is placeholder copy, and nothing renders unless it has a value.
 */
import PORTFOLIO_ITEMS from "../../data.json";

/** 93361 -> "93.4K", 191634 -> "191.6K", 1_240_000 -> "1.2M". */
export function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

/** First sentence of the brief — the card shows one line, not a paragraph. */
const firstSentence = (text: string) => {
  const match = text.match(/^.*?[.!?](?=\s|$)/);
  return (match?.[0] ?? text).trim();
};

export const FILM_CARDS = PORTFOLIO_ITEMS.map((item, i) => ({
  key: `film-${item.id}`,
  /** Index stamp on the card — "01", "02", … */
  index: String(i + 1).padStart(2, "0"),
  image: item.image,
  video: item.video,
  title: item.client,
  eyebrow: item.category,
  summary: firstSentence(item.description),
  stats: [
    { label: "Views", value: formatCount(item.viewsCount) },
    { label: "Likes", value: formatCount(item.likesCount) },
    { label: "Comments", value: formatCount(item.commentsCount) },
  ],
  meta: {
    client: item.client,
    category: item.category,
    reach: `${formatCount(item.viewsCount)} views`,
  },
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
  buttonLabel: "Get Started",
  buttonHref: "#contact",
  subtext: "",
  bookingHeading: "Book a call",
  bookingSubtext: "Pick a time",
  /**
   * Replace `your-name/15min` with your own Calendly event link.
   * The query params style the widget to match the dark section —
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
  name: "VR",
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
