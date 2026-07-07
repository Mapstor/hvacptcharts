/**
 * Post-build metadata verification.
 *
 * Walks .next/server/app/**\/*.html, parses each with cheerio, and asserts
 * the pageMetadata() helper produced correct per-page values — the actual
 * runtime output, not just source-code shape. Task 1 (2026-07) added this
 * to catch the metadata inheritance leak where 46 pages emitted the root
 * layout's og:url/og:title.
 *
 * Also emits reports/serp-inventory.csv — the SERP audit baseline that
 * Task 3 (SERP CTR overhaul) will regenerate and diff against.
 *
 * Usage:
 *   pnpm run verify-metadata               # assertions only
 *   pnpm run verify-metadata --emit-inventory  # also write CSV
 *
 * Exit codes:
 *   0 — all hard assertions pass (warnings emitted to stderr, not fatal)
 *   1 — one or more hard assertions failed
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import * as cheerio from "cheerio";

const ROOT = process.cwd();
const HTML_ROOT = join(ROOT, ".next", "server", "app");
const REPORT_DIR = join(ROOT, "reports");

const SITE_URL = "https://hvacptcharts.com";
const ROOT_DEFAULT_TITLE = "HVAC PT Charts — Verified Pressure-Temperature Data";
const ROOT_DEFAULT_OG_URL = SITE_URL;

const shouldEmitInventory = process.argv.includes("--emit-inventory");

// Routes intentionally exempt from all assertions:
// - "/" (homepage) is BY DESIGN inheriting from the layout defaults.
// - "/_not-found/" and "/_global-error/" are Next.js internals (built even
//   though they aren't reachable via normal navigation).
// - "/dev/**" is the internal SVG component gallery. Noindex'd via robots.ts
//   Disallow: /dev/ and via its layout metadata. Not a user-facing page.
// Refrigerant [slug] template is exempt in Task 1 only (see the sprint plan);
// Task 3 will convert it, and this exemption is removed then.
const EXEMPT_EXACT = new Set<string>(["/", "/_not-found/", "/_global-error/"]);
const EXEMPT_PREFIXES = ["/dev/"];
function isExempt(route: string): boolean {
  return EXEMPT_EXACT.has(route) || EXEMPT_PREFIXES.some((p) => route.startsWith(p));
}

interface PageRecord {
  route: string;
  file: string;
  title: string;
  description: string;
  canonical: string;
  ogUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  h1: string;
  h1Count: number;
}

function walkHtml(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walkHtml(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

function fileToRoute(absPath: string): string {
  const rel = relative(HTML_ROOT, absPath).replace(/\\/g, "/");
  if (rel === "index.html") return "/";
  const base = rel.replace(/\.html$/, "");
  // Next.js writes /refrigerant/r-410a/page.html-ish paths as
  // refrigerant/r-410a.html — join back with leading slash + trailing slash.
  return "/" + base + "/";
}

function extract(file: string): PageRecord {
  const html = readFileSync(file, "utf8");
  const $ = cheerio.load(html);
  const g = (sel: string, attr = "content") =>
    ($(sel).first().attr(attr) ?? "").trim();
  const route = fileToRoute(file);
  return {
    route,
    file,
    title: ($("title").first().text() ?? "").trim(),
    description: g('meta[name="description"]'),
    canonical: g('link[rel="canonical"]', "href"),
    ogUrl: g('meta[property="og:url"]'),
    ogTitle: g('meta[property="og:title"]'),
    ogDescription: g('meta[property="og:description"]'),
    ogImage: g('meta[property="og:image"]'),
    twitterTitle: g('meta[name="twitter:title"]'),
    twitterDescription: g('meta[name="twitter:description"]'),
    h1: ($("h1").first().text() ?? "").trim(),
    h1Count: $("h1").length,
  };
}

function main() {
  if (!existsSync(HTML_ROOT)) {
    console.error(
      `[verify-metadata] .next/server/app not found — run \`pnpm build\` first.`,
    );
    process.exit(1);
  }

  const files = walkHtml(HTML_ROOT).sort();
  const records = files.map(extract).sort((a, b) => a.route.localeCompare(b.route));

  const hardFailures: string[] = [];
  const warnings: string[] = [];

  for (const r of records) {
    const exempt = isExempt(r.route);
    if (exempt) continue;

    // ── HARD ASSERTIONS ──────────────────────────────────────────
    // (a) og:url must not be the root default.
    if (r.ogUrl === ROOT_DEFAULT_OG_URL) {
      hardFailures.push(
        `${r.route}: og:url leaked root default "${ROOT_DEFAULT_OG_URL}" (metadata inheritance bug)`,
      );
    }
    // (b) og:title must not be the root default.
    if (r.ogTitle === ROOT_DEFAULT_TITLE) {
      hardFailures.push(
        `${r.route}: og:title leaked root default "${ROOT_DEFAULT_TITLE}"`,
      );
    }
    // (c) canonical must equal og:url when both are set.
    if (r.canonical && r.ogUrl && r.canonical !== r.ogUrl) {
      hardFailures.push(
        `${r.route}: canonical ("${r.canonical}") !== og:url ("${r.ogUrl}")`,
      );
    }
    // (d) Exactly one <h1> per page.
    if (r.h1Count === 0) {
      hardFailures.push(`${r.route}: no <h1>`);
    } else if (r.h1Count > 1) {
      hardFailures.push(`${r.route}: ${r.h1Count} <h1> elements (must be 1)`);
    }
    // (e) Every non-exempt route must have a canonical.
    if (!r.canonical) {
      hardFailures.push(`${r.route}: no <link rel="canonical">`);
    }
  }

  // ── WARN-ONLY (uniqueness — promoted to hard-fail in Task 3) ──────
  const byTitle = new Map<string, string[]>();
  const byDesc = new Map<string, string[]>();
  for (const r of records) {
    if (isExempt(r.route)) continue;
    if (r.title) {
      const arr = byTitle.get(r.title) ?? [];
      arr.push(r.route);
      byTitle.set(r.title, arr);
    }
    if (r.description) {
      const arr = byDesc.get(r.description) ?? [];
      arr.push(r.route);
      byDesc.set(r.description, arr);
    }
  }
  for (const [title, routes] of byTitle) {
    if (routes.length > 1) {
      warnings.push(`duplicate title on ${routes.length} routes: "${title.slice(0, 80)}" → ${routes.join(", ")}`);
    }
  }
  for (const [desc, routes] of byDesc) {
    if (routes.length > 1) {
      warnings.push(`duplicate description on ${routes.length} routes: "${desc.slice(0, 80)}…" → ${routes.join(", ")}`);
    }
  }

  // ── REPORT ────────────────────────────────────────────────────────
  console.log(`[verify-metadata] scanned ${records.length} routes`);
  if (warnings.length > 0) {
    console.log(`[verify-metadata] ${warnings.length} warning(s) (Task 3 promotes these to hard-fail):`);
    for (const w of warnings) console.log("  WARN " + w);
  }
  if (hardFailures.length > 0) {
    console.error(`\n[verify-metadata] ${hardFailures.length} HARD FAILURE(S):`);
    for (const f of hardFailures) console.error("  FAIL " + f);
  } else {
    console.log(`[verify-metadata] all hard assertions passed ✓`);
  }

  // ── INVENTORY CSV ─────────────────────────────────────────────────
  if (shouldEmitInventory) {
    if (!existsSync(REPORT_DIR)) mkdirSync(REPORT_DIR, { recursive: true });
    const csvPath = join(REPORT_DIR, "serp-inventory.csv");
    const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
    const header = [
      "route",
      "title",
      "title_chars",
      "description",
      "desc_chars",
      "h1",
      "og_image",
      "canonical",
    ].join(",");
    const rows = records.map((r) =>
      [
        esc(r.route),
        esc(r.title),
        String(r.title.length),
        esc(r.description),
        String(r.description.length),
        esc(r.h1),
        esc(r.ogImage),
        esc(r.canonical),
      ].join(","),
    );
    writeFileSync(csvPath, [header, ...rows].join("\n") + "\n", "utf8");
    console.log(`[verify-metadata] wrote ${csvPath} (${records.length} rows)`);
  }

  process.exit(hardFailures.length > 0 ? 1 : 0);
}

main();
