/**
 * Post-build metadata verification.
 *
 * Walks .next/server/app/**\/*.html, parses each with cheerio, and asserts
 * the pageMetadata() helper produced correct per-page values — the actual
 * runtime output, not just source-code shape. Task 1 (2026-07) added this
 * to catch the metadata inheritance leak where 46 pages emitted the root
 * layout's og:url/og:title.
 *
 * Task 3 (2026-07-08) promoted the CTR-copy invariants from warn-only to
 * hard-fail: title ≤68 chars, description 140-165 chars, H1 contains the
 * route's head term, no duplicate titles/descriptions, no hyphenated
 * refrigerant designations in SERP surfaces.
 *
 * Also emits reports/serp-inventory.csv or a custom name via
 *   --emit-inventory[=<basename>]
 *
 * Usage:
 *   pnpm run verify-metadata                             # assertions only
 *   pnpm run verify-metadata --emit-inventory            # + serp-inventory.csv
 *   pnpm run verify-metadata --emit-inventory=foo        # + foo.csv
 *
 * Exit codes:
 *   0 — all hard assertions pass
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

// Marko's approved 73-char allowance — everything else must be ≤68.
const TITLE_MAX = 68;
const TITLE_MAX_ALLOWED = 73;
const TITLE_LENGTH_EXEMPTIONS = new Set<string>([
  "/pt-calculator/",
  "/psychrometric-calculator/",
]);
const DESC_MIN = 140;
const DESC_MAX = 165;

// Per-template head-term rules. For refrigerant/[slug]/ we can't inline all
// 61 seoNames here; the H1 rule for that template is "contains 'PT Chart'"
// which the buildRefrigerantMetadata generator guarantees.
interface HeadTermRule {
  match: (route: string) => boolean;
  headTerms: (route: string) => string[];
}
const HEAD_TERM_RULES: HeadTermRule[] = [
  {
    match: (r) => r.startsWith("/refrigerant/"),
    headTerms: () => ["PT Chart"],
  },
  {
    match: (r) => r.startsWith("/what-pressure-should-"),
    headTerms: (r) => {
      // Route form /what-pressure-should-{seoNameLowercase}/  → expect the
      // seoName (uppercased) or the phrase "Pressure Should" in the H1.
      const seg = r.replace(/^\/what-pressure-should-/, "").replace(/\/$/, "");
      return [seg.toUpperCase(), "Pressure Should"];
    },
  },
  {
    match: (r) => /^\/r-\d+.*-vs-r-\d+/.test(r),
    headTerms: () => ["vs"],
  },
];

// Parse --emit-inventory[=<basename>]
function inventoryBasename(): string | null {
  for (const arg of process.argv.slice(2)) {
    if (arg === "--emit-inventory") return "serp-inventory";
    if (arg.startsWith("--emit-inventory=")) return arg.split("=", 2)[1] ?? "serp-inventory";
  }
  return null;
}
const inventoryName = inventoryBasename();

// Routes intentionally exempt from all assertions:
// - "/" (homepage) is BY DESIGN inheriting from the layout defaults.
// - "/_not-found/" and "/_global-error/" are Next.js internals.
// - "/dev/**" is the internal SVG component gallery (robots.ts blocks it).
// - Legal/static pages are exempt from the hard uniqueness + length rules
//   (Marko's spec: "Static/legal + homepage: leave titles as-is"). They
//   still must not emit root-default OG tags.
const EXEMPT_ALL = new Set<string>(["/", "/_not-found/", "/_global-error/"]);
const EXEMPT_PREFIXES_ALL = ["/dev/"];
const EXEMPT_FROM_STRICT = new Set<string>([
  "/privacy-policy/",
  "/terms-of-service/",
  "/contact-us/",
  "/about-us/",
]);
function isFullyExempt(route: string): boolean {
  return EXEMPT_ALL.has(route) || EXEMPT_PREFIXES_ALL.some((p) => route.startsWith(p));
}
function isStrictExempt(route: string): boolean {
  return isFullyExempt(route) || EXEMPT_FROM_STRICT.has(route);
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

  for (const r of records) {
    if (isFullyExempt(r.route)) continue;

    // ── ALWAYS-APPLIED HARD ASSERTIONS (all non-fully-exempt routes) ──
    // (a) og:url / og:title not root default (metadata inheritance guard).
    if (r.ogUrl === ROOT_DEFAULT_OG_URL) {
      hardFailures.push(
        `${r.route}: og:url leaked root default (metadata inheritance bug)`,
      );
    }
    if (r.ogTitle === ROOT_DEFAULT_TITLE) {
      hardFailures.push(`${r.route}: og:title leaked root default`);
    }
    // (b) canonical present and equal to og:url when both are set.
    if (!r.canonical) {
      hardFailures.push(`${r.route}: no <link rel="canonical">`);
    } else if (r.ogUrl && r.canonical !== r.ogUrl) {
      hardFailures.push(
        `${r.route}: canonical ("${r.canonical}") !== og:url ("${r.ogUrl}")`,
      );
    }
    // (c) Exactly one <h1>.
    if (r.h1Count === 0) hardFailures.push(`${r.route}: no <h1>`);
    else if (r.h1Count > 1) hardFailures.push(`${r.route}: ${r.h1Count} <h1> elements`);

    // ── STRICT CTR-COPY ASSERTIONS (skip legal/static + homepage etc.) ──
    if (isStrictExempt(r.route)) continue;

    // (d) Title length: ≤68 unless allowlisted; hard cap 73 even then.
    const titleLen = r.title.length;
    const isAllowed73 = TITLE_LENGTH_EXEMPTIONS.has(r.route);
    if (titleLen > TITLE_MAX_ALLOWED) {
      hardFailures.push(`${r.route}: title ${titleLen}c > hard cap ${TITLE_MAX_ALLOWED}`);
    } else if (titleLen > TITLE_MAX && !isAllowed73) {
      hardFailures.push(
        `${r.route}: title ${titleLen}c > ${TITLE_MAX} (allowlist only ${[...TITLE_LENGTH_EXEMPTIONS].join(", ")})`,
      );
    }

    // (e) Description length: 140–165c.
    const descLen = r.description.length;
    if (descLen < DESC_MIN) {
      hardFailures.push(`${r.route}: description ${descLen}c < ${DESC_MIN}`);
    } else if (descLen > DESC_MAX) {
      hardFailures.push(`${r.route}: description ${descLen}c > ${DESC_MAX}`);
    }

    // (f) H1 must contain the route's head term (per-template rule).
    const rule = HEAD_TERM_RULES.find((rl) => rl.match(r.route));
    if (rule) {
      const terms = rule.headTerms(r.route);
      const anyMatch = terms.some((t) => r.h1.toLowerCase().includes(t.toLowerCase()));
      if (!anyMatch) {
        hardFailures.push(
          `${r.route}: H1 "${r.h1}" missing expected head term (any of: ${terms.join(", ")})`,
        );
      }
    }

    // (g) No hyphenated refrigerant designation (R-\d) in title/description/H1.
    const hyphenRe = /\bR-\d/;
    if (hyphenRe.test(r.title)) {
      hardFailures.push(`${r.route}: title contains hyphenated designation "R-\\d" (use seoName form): ${r.title}`);
    }
    if (hyphenRe.test(r.description)) {
      hardFailures.push(`${r.route}: description contains hyphenated designation "R-\\d"`);
    }
    if (hyphenRe.test(r.h1)) {
      hardFailures.push(`${r.route}: H1 contains hyphenated designation "R-\\d": ${r.h1}`);
    }
  }

  // ── STRICT UNIQUENESS (title + description) ────────────────────────
  const byTitle = new Map<string, string[]>();
  const byDesc = new Map<string, string[]>();
  for (const r of records) {
    if (isStrictExempt(r.route)) continue;
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
      hardFailures.push(
        `duplicate title on ${routes.length} routes: "${title.slice(0, 80)}" → ${routes.join(", ")}`,
      );
    }
  }
  for (const [desc, routes] of byDesc) {
    if (routes.length > 1) {
      hardFailures.push(
        `duplicate description on ${routes.length} routes: ${routes.join(", ")}`,
      );
    }
  }

  // ── REPORT ────────────────────────────────────────────────────────
  console.log(`[verify-metadata] scanned ${records.length} routes`);
  if (hardFailures.length > 0) {
    console.error(`\n[verify-metadata] ${hardFailures.length} HARD FAILURE(S):`);
    for (const f of hardFailures) console.error("  FAIL " + f);
  } else {
    console.log(`[verify-metadata] all hard assertions passed ✓`);
  }

  // ── INVENTORY CSV ─────────────────────────────────────────────────
  if (inventoryName) {
    if (!existsSync(REPORT_DIR)) mkdirSync(REPORT_DIR, { recursive: true });
    const csvPath = join(REPORT_DIR, `${inventoryName}.csv`);
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
