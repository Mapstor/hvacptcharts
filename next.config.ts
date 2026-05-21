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
      { source: "/refrigerant-prices", destination: "/refrigerant-prices-guide/", permanent: true },
      { source: "/pressure-diagnostic-tool", destination: "/system-pressure-diagnostic-calculator/", permanent: true },
    ];
  },
};

export default nextConfig;
