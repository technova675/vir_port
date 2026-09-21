/** @type {import("next").NextConfig} */
const nextConfig = {
  /**
   * The site is four static routes with no server behaviour — no route
   * handlers, no server actions, no dynamic APIs — so it ships as plain files
   * and is uploaded to the host, rather than being built there. This sidesteps
   * the deploy host entirely: its glibc is older than 2.29, so the native SWC
   * binary will not load, and Turbopack has no WASM fallback to fall back to.
   *
   * Output lands in out/. That is the folder to upload.
   */
  output: "export",

  /**
   * Dev-only. Next blocks cross-origin requests to /_next dev assets by
   * default, which breaks testing on a phone over the LAN — the browser's
   * origin is the machine's LAN IP, not localhost. Listed as bare
   * hostnames: no scheme, no port.
   *
   * A wildcard, not a literal IP. These are DHCP leases, so pinning one host
   * (this was "192.168.1.2") breaks the moment the router hands out a
   * different address — which is exactly what happened. Next matches these
   * patterns by splitting on ".", and an IPv4 quad splits the same way domain
   * labels do, so "*" stands in for the final octet and covers the subnet.
   *
   * Scope: any device on this /24 may request dev assets. That is the same
   * trust boundary the dev server already has by listening on the LAN at all,
   * and it never applies to production — `allowedDevOrigins` is read only by
   * `next dev`. If you move to a different subnet (10.x, 192.168.0.x), add it
   * here; "*" matches one octet, so widening to a /16 needs "192.168.*.*".
   */
  allowedDevOrigins: ["192.168.1.*"],

  images: {
    /**
     * The optimizer is a server route, and there is no server. Every <Image>
     * now emits its src untouched, so the bytes on the wire are whatever the
     * origin sends:
     *
     *   - public/hero/* is already encoded to responsive avif/webp/jpeg sets
     *     by scripts/generate-hero-images.mjs, so nothing is lost there.
     *   - The framerusercontent logo is sized by Framer's own CDN via its
     *     query string.
     *   - The six R2 portfolio stills are served as-is. Run
     *     scripts/shrink-portfolio-stills.mjs and upload the results if the
     *     originals on R2 are still the 1.4-1.9MB exports, because nothing
     *     downstream will resize them any more.
     */
    unoptimized: true,
  },

  /**
   * `headers()` is a server feature and is not honoured by `output: "export"`.
   * The hero cache window it used to set now lives in public/.htaccess, which
   * is copied into out/ verbatim and read by the host's Apache/LiteSpeed.
   * Keep the two in sync.
   */
};

export default nextConfig;
