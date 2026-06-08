import type { MetadataRoute } from "next";

/**
 * PWA web app manifest. Enables "Add to Home Screen" on mobile,
 * gives the site a proper installable identity, and tells crawlers
 * the canonical site name/theme color.
 *
 * Icons reference Next.js metadata routes (app/icon.svg, app/apple-icon.tsx)
 * which are served at /icon.svg and /apple-icon respectively.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HVAC PT Charts",
    short_name: "PT Charts",
    description:
      "Verified saturation pressure-temperature data for 61 refrigerants, plus calculators for superheat, subcooling, charge, and retrofit.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["education", "utilities", "productivity"],
    lang: "en-US",
  };
}
