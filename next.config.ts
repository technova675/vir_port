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
