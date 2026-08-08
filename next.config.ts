import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Dev-only. Next blocks cross-origin requests to /_next dev assets by
   * default, which breaks testing on a phone over the LAN — the browser's
   * origin is the machine's LAN IP, not localhost. Listed as bare
   * hostnames: no scheme, no port.
   *
   * This is a DHCP address, so if the router reassigns it, update the
   * entry (or reserve a static lease) — the same warning will reappear
   * with whatever the new IP is.
   */
  allowedDevOrigins: ["192.168.1.2"],
};

export default nextConfig;
