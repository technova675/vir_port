/**
 * X/Twitter gets the same card as Open Graph.
 *
 * Next treats `twitter-image` and `opengraph-image` as separate routes, so the
 * file has to exist even when the artwork is identical — re-exporting keeps
 * one drawing rather than two that drift apart.
 */
export { default, alt, size, contentType } from "./opengraph-image";
