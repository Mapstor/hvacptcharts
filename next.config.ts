import type { NextConfig } from "next";

/**
 * Note on redirects + trailingSlash:
 *
 * With trailingSlash: true, Next normalizes requests to add `/`. A redirect
 * source like `/calculators` matches both `/calculators` and `/calculators/`.
 * For destinations, the explicit trailing slash collapses the redirect chain
 * to a single hop (otherwise the browser does /calculators → /calculators/ →
 * /calculators-hub → /calculators-hub/, four round trips). With explicit
 * trailing slashes in destinations it's a single 301, which is what crawlers
 * prefer.
 *
 * Status codes:
 *   - `permanent: true`     → 308 (modern; preserves request method)
 *   - `statusCode: 301`     → 301 (canonical "Moved Permanently"; SEO standard)
 *
 * SEO migration redirects from the previous WordPress site use 301 explicitly
 * — Google and other crawlers treat them identically to 308, but 301 has been
 * the URL-rename signal for 25+ years and is what most SEO tooling expects.
 */
const nextConfig: NextConfig = {
  trailingSlash: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  async redirects() {
    return [
      // ──────────────────────────────────────────────────────────────────
      // Internal shortcuts (kept from the rebuild — convenient short URLs)
      // ──────────────────────────────────────────────────────────────────
      { source: "/calculators", destination: "/calculators-hub/", permanent: true },
      { source: "/pt-charts-tools", destination: "/pt-charts-tools-hub/", permanent: true },
      { source: "/guides", destination: "/guides-hub/", permanent: true },
      // (/r-410a-vs-r-32 and /pressure-diagnostic-tool moved below and changed
      //  to statusCode:301 — they are legacy WP URLs, not internal shortcuts.)

      // ──────────────────────────────────────────────────────────────────
      // WordPress migration redirects (statusCode: 301)
      // Every URL below was indexed on the previous WordPress site as of
      // the sitemap snapshot dated 2025-11-27. Without these 301s the URLs
      // would 404 the moment nameservers point at Vercel, dropping months
      // of accumulated authority and any in-flight Google rankings.
      // ──────────────────────────────────────────────────────────────────

      // ── 6× what-pressure URL rename: WP appended "-be"; we don't
      { source: "/what-pressure-should-410a-be", destination: "/what-pressure-should-410a/", statusCode: 301 },
      { source: "/what-pressure-should-r22-be", destination: "/what-pressure-should-r22/", statusCode: 301 },
      { source: "/what-pressure-should-r134a-be", destination: "/what-pressure-should-r134a/", statusCode: 301 },
      { source: "/what-pressure-should-r404a-be", destination: "/what-pressure-should-r404a/", statusCode: 301 },
      { source: "/what-pressure-should-r32-be", destination: "/what-pressure-should-r32/", statusCode: 301 },
      { source: "/what-pressure-should-r454b-be", destination: "/what-pressure-should-r454b/", statusCode: 301 },
      // Typo variant still requested by search engines (missing the second
      // "r" in "pressure"); 404s today. → canonical R-404A what-pressure page.
      { source: "/what-pressue-should-r404a-be", destination: "/what-pressure-should-r404a/", statusCode: 301 },

      // ── /refrigerant index: WP listed all 61 here; the canonical index is
      // now the PT-charts & tools hub (the homepage hosts the live browser).
      { source: "/refrigerant", destination: "/pt-charts-tools-hub/", statusCode: 301 },

      // ── Stray /r-410a/ URL (never a real page — audit found leftover
      // external inbound links pointing here). Redirect to the canonical
      // refrigerant detail page.
      { source: "/r-410a", destination: "/refrigerant/r-410a/", statusCode: 301 },

      // ── R-1233zd(Z) merged into R-1233zd(E) (task 4C, 2026-09). The cis
      // isomer is research-grade — no CoolProp 8 equation of state and no
      // commercial product — so its page was removed. 301 to the commercial
      // (E) isomer, which carries the E/Z isomer explanation.
      { source: "/refrigerant/r-1233zd-z", destination: "/refrigerant/r-1233zd-e/", statusCode: 301 },

      // ── Duplicate / old-form comparison URLs → canonical ordered pair.
      // WP served /r-410a-vs-r-32/ as its own page (duplicate of the canonical
      // /r-32-vs-r-410a/); /r410a-vs-r32/ (no hyphens) and the reversed
      // /r-134a-vs-r-1234yf/ 404 today. All 301 to the single canonical page.
      { source: "/r-410a-vs-r-32", destination: "/r-32-vs-r-410a/", statusCode: 301 },
      { source: "/r410a-vs-r32", destination: "/r-32-vs-r-410a/", statusCode: 301 },
      { source: "/r-134a-vs-r-1234yf", destination: "/r-1234yf-vs-r-134a/", statusCode: 301 },

      // ── Legacy diagnostic-tool URL → the equivalent calculator. Per spec 03
      // the two are consolidated under one page; 301 the WP URL to it.
      { source: "/pressure-diagnostic-tool", destination: "/system-pressure-diagnostic-calculator/", statusCode: 301 },

      // ── Legacy /refrigerant-prices/ → canonical guide. WP served both
      // /refrigerant-prices/ and /refrigerant-prices-guide/ (the former's
      // canonical already pointed at the latter — see 02-AUDIT.md:429, spec
      // 03:220-226). 301 the shorter legacy URL to the ported guide.
      { source: "/refrigerant-prices", destination: "/refrigerant-prices-guide/", statusCode: 301 },

      // /refrigerant-prices-guide/ — PORTED (regulatory + market mechanics, no spot prices)
      // Carrier 410A charging chart: PORTED — page now lives at the canonical
      // URL with chart table, R-410A pressure cross-reference, 3 worked
      // examples, charging procedure, FAQ, and interactive WB×OD lookup.
      // (Was previously a 301 → /refrigerant/r-410a/; removed once page shipped.)

      // Psychrometric, duct-size, hvac-load calculators: ALL PORTED.

      // ── HVAC long-form guides (task 4A, 2026-09): 12 off-topic guides were
      // removed and now serve 410 Gone from src/app/<slug>/route.ts. Two guides
      // that merely duplicate a calculator are 301'd to that calculator instead.
      // Three guides stay live (troubleshooting, refrigerant-recovery,
      // ductless-mini-split), Google-noindexed pending rewrite (task 4B).
      { source: "/hvac-load-calculation-guide", destination: "/hvac-load-calculator/", statusCode: 301 },
      { source: "/hvac-duct-design-guide", destination: "/duct-size-calculator/", statusCode: 301 },

      // ── WordPress cruft (Task 5, 2026-07): sitemap variants, taxonomy
      // archives, and author archives all redirect to the appropriate live
      // destination. Wildcards catch every WP-generated URL pattern that
      // Google indexed during the WordPress era so we don't leak equity
      // through soft-404s during the recrawl window.
      // /wp-sitemap*.xml matches /wp-sitemap.xml and every numbered
      // sub-sitemap (wp-sitemap-posts-1.xml, wp-sitemap-taxonomies-cat-1.xml,
      // etc.); all go to the canonical Next.js sitemap.
      // Named-param+regex form is what path-to-regexp v6 accepts — plain
      // `:rest*` is rejected because the * modifier requires a `/` prefix.
      { source: "/wp-sitemap:rest(.*)", destination: "/sitemap.xml", statusCode: 301 },
      { source: "/category/:path*", destination: "/", statusCode: 301 },
      { source: "/tag/:path*", destination: "/", statusCode: 301 },
      { source: "/author/:path*", destination: "/", statusCode: 301 },
      // WP feeds — the site's Atom feed lives at /feed.xml.
      { source: "/feed", destination: "/feed.xml", statusCode: 301 },
      { source: "/feed/", destination: "/feed.xml", statusCode: 301 },

      // ──────────────────────────────────────────────────────────────────
      // External (ads.txt) — Raptive serves the authoritative file on
      // their domain so updates (new SSP / vendor adds) propagate without
      // code changes. statusCode 301 per Raptive's integration spec.
      // ──────────────────────────────────────────────────────────────────
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
