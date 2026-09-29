#!/usr/bin/env node
/**
 * Mobile-overflow QA (Task 10) — NOT a build gate. Loads the 9 operating-pressure
 * routes at 360×800 and asserts document.documentElement.scrollWidth ≤ 360 (no
 * page-level horizontal overflow; wide tables must scroll inside their own box).
 * Usage: node scripts/qa/check-360.mjs [--base http://localhost:3200]
 * If Playwright (or its browser) is unavailable, it prints a skip notice and exits 0.
 */
const argv = process.argv.slice(2);
const BASE = (argv[argv.indexOf("--base") + 1] || "http://localhost:3200").replace(/\/$/, "");
const ROUTES = [
  "/what-pressure-should-r22/",
  "/what-pressure-should-410a/",
  "/what-pressure-should-r32/",
  "/what-pressure-should-r454b/",
  "/what-pressure-should-r407c/",
  "/what-pressure-should-r404a/",
  "/what-pressure-should-r449a/",
  "/what-pressure-should-r454c/",
  "/what-pressure-should-r744/",
];

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.log("[check-360] Playwright not installed — skipping 360px overflow check.");
  process.exit(0);
}

let browser;
try {
  browser = await chromium.launch();
} catch (e) {
  console.log(`[check-360] Playwright browser unavailable (${e.message.split("\n")[0]}) — skipping 360px overflow check.`);
  process.exit(0);
}

const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
let fails = 0;
console.log(`[check-360] viewport 360×800 against ${BASE}`);
for (const route of ROUTES) {
  const resp = await page.goto(BASE + route, { waitUntil: "networkidle" }).catch((e) => ({ ok: () => false, _err: e.message }));
  if (!resp || !resp.ok?.()) {
    console.log(`  ✗ ${route} — failed to load${resp?._err ? " (" + resp._err.split("\n")[0] + ")" : ""}`);
    fails++;
    continue;
  }
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  const ok = sw <= 360;
  if (!ok) fails++;
  console.log(`  ${ok ? "✓" : "✗"} ${route} — scrollWidth ${sw}px ${ok ? "≤ 360" : "> 360 (OVERFLOW)"}`);
}
await browser.close();
console.log(fails ? `[check-360] ${fails} route(s) overflow 360px` : "[check-360] OK — no route overflows 360px");
process.exit(0);
