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
      { source: "/r-410a-vs-r-32", destination: "/r-32-vs-r-410a/", permanent: true },
      { source: "/pressure-diagnostic-tool", destination: "/system-pressure-diagnostic-calculator/", permanent: true },

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

      // ── /refrigerant/ index: WP had a list of all 61; our homepage hosts the browser
      { source: "/refrigerant", destination: "/", statusCode: 301 },

      // /refrigerant-prices-guide/ — PORTED (regulatory + market mechanics, no spot prices)
      // Carrier 410A charging chart: PORTED — page now lives at the canonical
      // URL with chart table, R-410A pressure cross-reference, 3 worked
      // examples, charging procedure, FAQ, and interactive WB×OD lookup.
      // (Was previously a 301 → /refrigerant/r-410a/; removed once page shipped.)

      // Psychrometric, duct-size, hvac-load calculators: ALL PORTED.

      // ── HVAC long-form guides (Phase 7 port-as-is) → guides hub
      // /hvac-troubleshooting-guide/ — PORTED (decision trees for 10 symptom categories)
      // /hvac-load-calculation-guide/ — PORTED (Manual J explainer, companion to load calculator)
      // /hvac-refrigerant-recovery-guide/ — PORTED (EPA Section 608 procedure + A2L safety)
      // /hvac-duct-design-guide/ — PORTED (Manual D explainer, companion to duct calculator)
      // /hvac-energy-efficiency-guide/ — PORTED (SEER2/HSPF2/AFUE + heat pump economics + IRA)
      // /hvac-commissioning-guide/ — PORTED (Manual T + QI Std 5 + duct/blower testing)
      // /hvac-controls-automation-guide/ — PORTED (thermostats + zoning + BAS + Matter)
      // /hvac-maintenance-service-guide/ — PORTED (seasonal schedule + 14-pt tune-up + ROI)
      // /hvac-indoor-air-quality-guide/ — PORTED (5 pollutant categories + ASHRAE 62.2 + radon)
      // /hvac-system-design-guide/ — PORTED (design capstone — full ACCA cascade)
      // /hvac-mechanical-ventilation-guide/ — PORTED (ASHRAE 62.2 + ERV/HRV + climate strategy)
      // /hvac-safety-procedures-guide/ — PORTED (OSHA + LOTO + electrical + gas + A2L + PPE)
      // /hvac-tools-equipment-guide/ — PORTED (13 tool categories, brand lineups, EPA 608 + AHRI 740)
      // /hvac-retrofitting-upgrades-guide/ — PORTED (R-22 + A2L transition + heat pump + IRA + repair-vs-replace)
      // /hvac-energy-management-guide/ — PORTED (auditing + benchmarking + RCx + FDD + M&V + BPS)
      // /hvac-building-automation-guide/ — PORTED (commercial BMS architecture + Guideline 36 + cybersecurity)

      // ── WordPress cruft: author archive page, no SEO value
      { source: "/author/infohvacptcharts-com", destination: "/", statusCode: 301 },

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
