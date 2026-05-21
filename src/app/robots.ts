import type { MetadataRoute } from "next";

/**
 * Per docs/spec/03-SITEMAP_MIGRATION.md. No LLM-bot blocking — Google has
 * confirmed `llms.txt` is not a factor and we want LLM citation surface area.
 *
 * The /dev/ rule blocks the SVG component gallery (also noindex'd in its
 * layout metadata) and any future internal preview routes. /api/ and /_next/
 * are best-practice blocks for build/runtime internals.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/dev/"],
      },
    ],
    sitemap: "https://hvacptcharts.com/sitemap.xml",
  };
}
