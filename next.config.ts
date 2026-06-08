import type { NextConfig } from "next";

/**
 * Note on redirects + trailingSlash:
 *
 * With trailingSlash: true, Next normalizes requests to add `/`. A redirect
 * source like `/calculators` matches both `/calculators` and `/calculators/`.
 * For destinations, however, including the trailing slash explicitly is what
 * collapses the redirect chain to a single hop — otherwise the browser does
 *   /calculators → /calculators/ → /calculators-hub → /calculators-hub/
 * (4 round trips). With explicit trailing slashes in destinations, it's
 *   /calculators → /calculators-hub/
 * (1 round trip), which is what crawlers prefer.
 */
const nextConfig: NextConfig = {
  trailingSlash: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  async redirects() {
    return [
      { source: "/calculators", destination: "/calculators-hub/", permanent: true },
      { source: "/pt-charts-tools", destination: "/pt-charts-tools-hub/", permanent: true },
      { source: "/guides", destination: "/guides-hub/", permanent: true },
      { source: "/r-410a-vs-r-32", destination: "/r-32-vs-r-410a/", permanent: true },
      // /refrigerant-prices → /refrigerant-prices-guide/ removed — destination
      // doesn't exist yet (pending source decision); restore when the page lands.
      { source: "/pressure-diagnostic-tool", destination: "/system-pressure-diagnostic-calculator/", permanent: true },
      // ads.txt — Raptive serves the authoritative file on their domain so
      // updates (new SSP / vendor adds) propagate automatically without code
      // changes. statusCode 301 (not 308) per Raptive's integration spec.
      {
        source: "/ads.txt",
        destination: "https://ads.adthrive.com/sites/68f28aad3e1aa05cf10f4d54/ads.txt",
        statusCode: 301,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
