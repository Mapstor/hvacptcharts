import type { MetadataRoute } from "next";

/**
 * Per docs/spec/03-SITEMAP_MIGRATION.md. No LLM-bot blocking — Google has
 * confirmed `llms.txt` is not a factor and we want LLM citation surface area.
 *
 * /_next/ is intentionally NOT disallowed. It serves the JavaScript, CSS and
 * optimized images (/_next/static/*, /_next/image) that Googlebot must fetch
 * to render a page. Blocking it makes Google render pages unstyled and drop
 * anything drawn client-side — exactly the "can't fetch important resources"
 * failure Google's robots.txt guidance warns against. This is why Bing (which
 * still crawled these assets) ranks the site far higher than Google today.
 *
 * /api/ stays disallowed: there is no /api/ route in this app and no client
 * code fetches /api/, so nothing render-critical lives behind it. The rule is
 * a harmless guard against a future runtime endpoint being crawled. (The
 * public data exports live under /data/refrigerant/* and remain crawlable.)
 *
 * /dev/ stays disallowed: it fronts the SVG component gallery (also noindex'd
 * in its layout metadata) and any future internal preview routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dev/"],
      },
    ],
    sitemap: "https://hvacptcharts.com/sitemap.xml",
  };
}
