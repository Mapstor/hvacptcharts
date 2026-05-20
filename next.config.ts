import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  async redirects() {
    return [
      { source: "/calculators", destination: "/calculators-hub", permanent: true },
      { source: "/pt-charts-tools", destination: "/pt-charts-tools-hub", permanent: true },
      { source: "/guides", destination: "/guides-hub", permanent: true },
      { source: "/r-410a-vs-r-32", destination: "/r-32-vs-r-410a", permanent: true },
      { source: "/refrigerant-prices", destination: "/refrigerant-prices-guide", permanent: true },
      { source: "/pressure-diagnostic-tool", destination: "/system-pressure-diagnostic-calculator", permanent: true },
    ];
  },
};

export default nextConfig;
