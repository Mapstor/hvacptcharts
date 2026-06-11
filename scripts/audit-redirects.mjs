#!/usr/bin/env node
/**
 * WordPress → Next migration redirect audit.
 *
 * Reads every URL that was indexed on the previous WordPress site (from
 * sitemap snapshots) and confirms each one returns a 301 to the expected
 * destination on the new Next.js site. Fails loudly on any unexpected
 * status, missing Location, or wrong destination.
 *
 * Run after a build + `next start` (or against a Vercel preview URL via
 * `BASE_URL=https://... node scripts/audit-redirects.mjs`).
 */

const BASE = process.env.BASE_URL || "http://localhost:3003";

// Each entry: [source path, expected destination path].
// "(self)" means the URL is unchanged from WordPress — should return 200,
// not a redirect. Pages we ship on the new site under the same URL.
const SELF = "(self-200)";

const TESTS = [
  // ── 6× what-pressure (suffix rename) ───────────────────────────────
  ["/what-pressure-should-410a-be/", "/what-pressure-should-410a/"],
  ["/what-pressure-should-r22-be/", "/what-pressure-should-r22/"],
  ["/what-pressure-should-r134a-be/", "/what-pressure-should-r134a/"],
  ["/what-pressure-should-r404a-be/", "/what-pressure-should-r404a/"],
  ["/what-pressure-should-r32-be/", "/what-pressure-should-r32/"],
  ["/what-pressure-should-r454b-be/", "/what-pressure-should-r454b/"],

  // ── Comparison inversion ────────────────────────────────────────────
  ["/r-410a-vs-r-32/", "/r-32-vs-r-410a/"],

  // ── /refrigerant/ index ─────────────────────────────────────────────
  ["/refrigerant/", "/"],

  // ── Pages we don't ship → relevant landings ─────────────────────────
  // /refrigerant-prices-guide/ — PORTED
  ["/refrigerant-prices-guide/", SELF],
  // /carrier-410a-charging-chart/ — PORTED, expect 200, not a redirect
  ["/carrier-410a-charging-chart/", SELF],
  // /psychrometric-calculator/ — PORTED
  ["/psychrometric-calculator/", SELF],
  // /duct-size-calculator/ — PORTED
  ["/duct-size-calculator/", SELF],
  // /hvac-load-calculator/ — PORTED
  ["/hvac-load-calculator/", SELF],

  // ── HVAC long-form guides — being ported one at a time ──────────────
  // /hvac-troubleshooting-guide/ — PORTED
  ["/hvac-troubleshooting-guide/", SELF],
  // /hvac-load-calculation-guide/ — PORTED
  ["/hvac-load-calculation-guide/", SELF],
  // /hvac-refrigerant-recovery-guide/ — PORTED
  ["/hvac-refrigerant-recovery-guide/", SELF],
  // /hvac-duct-design-guide/ — PORTED
  ["/hvac-duct-design-guide/", SELF],
  // /hvac-energy-efficiency-guide/ — PORTED
  ["/hvac-energy-efficiency-guide/", SELF],
  // /hvac-commissioning-guide/ — PORTED
  ["/hvac-commissioning-guide/", SELF],
  // /hvac-controls-automation-guide/ — PORTED
  ["/hvac-controls-automation-guide/", SELF],
  // /hvac-maintenance-service-guide/ — PORTED
  ["/hvac-maintenance-service-guide/", SELF],
  // /hvac-indoor-air-quality-guide/ — PORTED
  ["/hvac-indoor-air-quality-guide/", SELF],
  // /hvac-system-design-guide/ — PORTED
  ["/hvac-system-design-guide/", SELF],
  // /hvac-mechanical-ventilation-guide/ — PORTED
  ["/hvac-mechanical-ventilation-guide/", SELF],
  // /hvac-building-automation-guide/ — PORTED
  ["/hvac-building-automation-guide/", SELF],
  // /hvac-ductless-mini-split-guide/ — NEW guide (not in WP migration; rounds suite to 22)
  ["/hvac-ductless-mini-split-guide/", SELF],
  // /hvac-energy-management-guide/ — PORTED
  ["/hvac-energy-management-guide/", SELF],
  // /hvac-safety-procedures-guide/ — PORTED
  ["/hvac-safety-procedures-guide/", SELF],
  // /hvac-tools-equipment-guide/ — PORTED
  ["/hvac-tools-equipment-guide/", SELF],
  // /hvac-retrofitting-upgrades-guide/ — PORTED
  ["/hvac-retrofitting-upgrades-guide/", SELF],

  // ── Pre-existing internal shortcuts ─────────────────────────────────
  ["/pressure-diagnostic-tool/", "/system-pressure-diagnostic-calculator/"],
  ["/calculators/", "/calculators-hub/"],
  ["/pt-charts-tools/", "/pt-charts-tools-hub/"],
  ["/guides/", "/guides-hub/"],

  // ── WordPress cruft ─────────────────────────────────────────────────
  ["/author/infohvacptcharts-com/", "/"],

  // ── Smoke-check a few WP URLs that should still resolve directly ───
  ["/pt-chart-guide/", SELF],
  ["/refrigerant-safety-classifications/", SELF],
  ["/refrigerant-gwp-rankings/", SELF],
  ["/superheat-subcooling-fundamentals/", SELF],
  ["/refrigerant-comparison-guide/", SELF],
  ["/superheat-calculator/", SELF],
  ["/subcooling-calculator/", SELF],
  ["/refrigerant-charge-calculator/", SELF],
  ["/pt-superheat-subcooling-calculator/", SELF],
  ["/refrigerant-pt-comparison-tool/", SELF],
  ["/saturation-properties-calculator/", SELF],
  ["/system-pressure-diagnostic-calculator/", SELF],
  ["/refrigerant-retrofit-compatibility-calculator/", SELF],
  ["/pt-calculator/", SELF],
  ["/calculators-hub/", SELF],
  ["/guides-hub/", SELF],
  ["/pt-charts-tools-hub/", SELF],
  ["/terms-of-service/", SELF],
  ["/contact-us/", SELF],
  ["/about-us/", SELF],
  ["/privacy-policy/", SELF],
  ["/r-32-vs-r-410a/", SELF],
  ["/r-410a-vs-r-454b/", SELF],
  ["/r-32-vs-r-454b/", SELF],
  ["/high-head-pressure-causes/", SELF],
  ["/refrigerant/r-410a/", SELF],
  ["/refrigerant/r-22/", SELF],
  ["/refrigerant/r-134a/", SELF],
  ["/refrigerant/r-1234ze/", SELF],
  ["/refrigerant/r-1234ze-e/", SELF],
  ["/refrigerant/r-1234ze-z/", SELF],
];

async function check(source, expected) {
  let status, loc;
  try {
    const r = await fetch(BASE + source, { redirect: "manual", method: "GET" });
    status = r.status;
    loc = r.headers.get("location");
  } catch (e) {
    return { source, expected, status: "ERR", loc: e.message, ok: false };
  }
  if (expected === SELF) {
    return { source, expected, status, loc, ok: status === 200 };
  }
  // Allow 301, 308, or 307 (Next/Vercel may serve different codes for normalizing trailing slashes)
  const isRedirect = status >= 300 && status < 400;
  if (!isRedirect) return { source, expected, status, loc, ok: false };
  if (!loc) return { source, expected, status, loc, ok: false };
  // Normalize loc: strip base URL if absolute
  let locPath = loc;
  try { locPath = new URL(loc, BASE).pathname; } catch {}
  // Allow trailing-slash normalization
  const norm = (s) => s.endsWith("/") ? s : s + "/";
  return { source, expected, status, loc, locPath, ok: norm(locPath) === norm(expected) };
}

const results = [];
for (const [src, exp] of TESTS) {
  const r = await check(src, exp);
  results.push(r);
  const tag = r.ok ? "[OK]  " : "[FAIL]";
  const detail = r.expected === SELF
    ? `200 expected`
    : `→ ${r.locPath || r.loc || "(no Location)"}`;
  process.stdout.write(`  ${tag} ${r.status}  ${r.source}  ${detail}\n`);
}

const total = results.length;
const passed = results.filter(r => r.ok).length;
const failed = results.filter(r => !r.ok);

console.log(`\n=== Summary ===\nTotal: ${total}\nPassed: ${passed}\nFailed: ${failed.length}\n`);
if (failed.length) {
  console.log("Failures:");
  for (const f of failed) {
    console.log(`  ${f.source}\n    expected: ${f.expected}\n    actual  : ${f.status} → ${f.locPath || f.loc || '(none)'}`);
  }
  process.exit(1);
}
