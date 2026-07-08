#!/usr/bin/env node
/**
 * Redirect unit-check for next.config.ts.
 *
 * Compiles each redirect source with path-to-regexp (the same library Next.js
 * uses at runtime) and asserts a curated test-case table produces the
 * expected destinations. Task 5 (2026-07) added this after the WordPress
 * cutover wildcards (/wp-sitemap, /category/*, /tag/*, /author/*, /r-410a/)
 * landed — the regressions that would matter most (a wildcard swallowing
 * a legitimate route, or a `-be` slug not redirecting) are exactly the
 * ones the test cases below cover.
 *
 * Exits 0 on all-pass, 1 on any mismatch.
 */
// Next.js bundles path-to-regexp internally; reaching for the bundled copy
// avoids adding a new top-level dependency. No types ship with the internal
// module, so silence the implicit-any check on this line only.
// @ts-expect-error - reaching into Next.js internal compiled dep
import { pathToRegexp, compile } from "next/dist/compiled/path-to-regexp/index.js";
import config from "../next.config";

interface RedirectDef {
  source: string;
  destination: string;
  permanent?: boolean;
  statusCode?: number;
  basePath?: false;
}

async function loadRedirects(): Promise<RedirectDef[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cfgAny = config as any;
  const r = typeof cfgAny.redirects === "function" ? await cfgAny.redirects() : [];
  return r as RedirectDef[];
}

interface TestCase {
  url: string;
  expected: string | null; // null = no redirect expected
  reason?: string;
}

const TESTS: TestCase[] = [
  // ── /r-410a stray → canonical ──────────────────────────────────
  { url: "/r-410a", expected: "/refrigerant/r-410a/", reason: "stray R-410A URL" },
  { url: "/r-410a/", expected: "/refrigerant/r-410a/", reason: "trailing-slash variant" },

  // ── what-pressure -be variants ─────────────────────────────────
  { url: "/what-pressure-should-410a-be", expected: "/what-pressure-should-410a/" },
  { url: "/what-pressure-should-r22-be", expected: "/what-pressure-should-r22/" },
  { url: "/what-pressure-should-r32-be", expected: "/what-pressure-should-r32/" },
  { url: "/what-pressure-should-r134a-be", expected: "/what-pressure-should-r134a/" },
  { url: "/what-pressure-should-r404a-be", expected: "/what-pressure-should-r404a/" },
  { url: "/what-pressure-should-r454b-be", expected: "/what-pressure-should-r454b/" },

  // ── comparison alias ───────────────────────────────────────────
  { url: "/r-410a-vs-r-32", expected: "/r-32-vs-r-410a/" },

  // ── WordPress sitemap variants ─────────────────────────────────
  { url: "/wp-sitemap.xml", expected: "/sitemap.xml" },
  { url: "/wp-sitemap-posts-post-1.xml", expected: "/sitemap.xml" },
  { url: "/wp-sitemap-taxonomies-category-1.xml", expected: "/sitemap.xml" },
  { url: "/wp-sitemap-users-1.xml", expected: "/sitemap.xml" },

  // ── WordPress taxonomy + author archives ───────────────────────
  { url: "/category/refrigerants/", expected: "/" },
  { url: "/category/refrigerants/r-410a/", expected: "/" },
  { url: "/tag/hvac/", expected: "/" },
  { url: "/tag/",  expected: "/" },
  { url: "/author/infohvacptcharts-com", expected: "/" },
  { url: "/author/someone", expected: "/" },
  { url: "/author/", expected: "/" },

  // ── /feed → atom feed ──────────────────────────────────────────
  { url: "/feed", expected: "/feed.xml" },
  { url: "/feed/", expected: "/feed.xml" },

  // ── existing internal shortcuts ────────────────────────────────
  { url: "/calculators", expected: "/calculators-hub/" },
  { url: "/guides", expected: "/guides-hub/" },
  { url: "/pt-charts-tools", expected: "/pt-charts-tools-hub/" },
  { url: "/pressure-diagnostic-tool", expected: "/system-pressure-diagnostic-calculator/" },

  // ── ads.txt ────────────────────────────────────────────────────
  {
    url: "/ads.txt",
    expected: "https://ads.adthrive.com/sites/68f28aad3e1aa05cf10f4d54/ads.txt",
  },

  // ── /refrigerant → homepage ────────────────────────────────────
  { url: "/refrigerant", expected: "/" },

  // ── NEGATIVE: routes that must NOT be caught by wildcards ──────
  { url: "/refrigerant/r-410a/", expected: null, reason: "must not redirect" },
  { url: "/what-pressure-should-410a/", expected: null, reason: "canonical target" },
  { url: "/what-pressure-should-r32/", expected: null, reason: "canonical target" },
  { url: "/sitemap.xml", expected: null, reason: "canonical sitemap" },
  { url: "/robots.txt", expected: null },
  { url: "/pt-calculator/", expected: null },
  { url: "/r-410a-vs-r-454b/", expected: null },
  { url: "/carrier-410a-charging-chart/", expected: null, reason: "contains 'r-410' but not a redirect target" },
];

async function main() {
  const redirects = await loadRedirects();
  console.log(`[verify-redirects] loaded ${redirects.length} redirects`);

  // Precompile each redirect's source and destination.
  //
  // Destinations may be external URLs containing `:` (as in `https://…`),
  // which path-to-regexp reads as a parameter marker. Fall back to a literal
  // toPath in that case so the compile step doesn't throw.
  const compiled = redirects.map((r) => {
    const keys: unknown[] = [];
    const re = pathToRegexp(r.source, keys);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let toPath: (params: Record<string, any>) => string;
    try {
      toPath = compile(r.destination);
    } catch {
      toPath = () => r.destination;
    }
    return { def: r, re, keys, toPath };
  });

  let failures = 0;
  for (const t of TESTS) {
    // Find first matching redirect.
    let matched: { def: RedirectDef; dest: string } | null = null;
    for (const c of compiled) {
      const m = c.re.exec(t.url);
      if (!m) continue;
      // Build params object from named keys.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: Record<string, any> = {};
      c.keys.forEach((k: unknown, i: number) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const key = (k as any).name;
        const val = m[i + 1];
        if (val === undefined) return;
        // If value contains "/" it's a wildcard capture — path-to-regexp
        // wants an array for repeat params.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const keyDef = k as any;
        if (keyDef.modifier === "*" || keyDef.modifier === "+") {
          params[key] = val.split("/");
        } else {
          params[key] = val;
        }
      });
      try {
        const dest = c.toPath(params);
        matched = { def: c.def, dest };
      } catch {
        matched = { def: c.def, dest: c.def.destination };
      }
      break;
    }

    const actual = matched?.dest ?? null;
    const pass = actual === t.expected;
    const status = pass ? "✓" : "✗";
    const suffix = t.reason ? ` (${t.reason})` : "";
    if (!pass) {
      failures++;
      console.log(`  ${status} ${t.url}${suffix}`);
      console.log(`      expected: ${t.expected}`);
      console.log(`      actual:   ${actual}`);
      if (matched) console.log(`      via source: ${matched.def.source}`);
    } else {
      console.log(`  ${status} ${t.url} → ${actual ?? "(no redirect)"}${suffix}`);
    }
  }

  console.log(
    `\n[verify-redirects] ${TESTS.length - failures}/${TESTS.length} passed`,
  );
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
