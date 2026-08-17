import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "framerusercontent.com",
      },
      /* Portfolio stills (src/lib/data.json). The originals are 1.4-2.4MB
         PNG/JPEG and R2 serves them with no Cache-Control, so they go
         through the optimizer rather than straight to the browser. */
      {
        protocol: "https",
        hostname: "pub-f1d7e227fc414580986e6b19571e55d3.r2.dev",
      },
    ],
    /* AVIF first: the stills are photographic, which is where it wins most
       over WebP. Both are tried before falling back to the original.
     *
     * Dev is WebP-only. The optimizer wraps the whole upstream fetch —
     * headers AND the body read loop — in a single AbortSignal.timeout(7000)
     * (image-optimizer.js, `fetchExternalImage`). AVIF encoding a 1.4-1.9MB
     * still is heavy enough that, with several cards decoding at once, the
     * event loop stops draining `res.body` before that 7s wall clock fires.
     * The abort then throws from inside the `for await` rather than the
     * fetch's own .catch, so it escapes as a bare TimeoutError and the route
     * 500s instead of returning the intended 504. Production doesn't hit this
     * — the optimized result is cached after the first request — so AVIF
     * stays on where it actually pays for itself. */
    formats:
      process.env.NODE_ENV === "development"
        ? ["image/webp"]
        : ["image/avif", "image/webp"],
    /* R2 sends these stills with no Cache-Control at all, so the optimizer
       falls back to this. 31 days rather than the 4h default because the
       artwork is fixed per delivered film — a re-export means a new
       filename in data.json, which is its own cache key. */
    minimumCacheTTL: 2678400,
  },

  /**
   * Files in public/ are served with `max-age=0, must-revalidate` by default,
   * which costs a conditional request on every repeat view. The hero crops are
   * the largest thing on the page and the first thing painted, so they get a
   * real cache window instead.
   *
   * NOT `immutable`: these filenames are not content-hashed. A 30-day window
   * with stale-while-revalidate means a re-export is picked up in the
   * background rather than being pinned for a year.
   */
  async headers() {
    return [
      {
        source: "/hero/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
