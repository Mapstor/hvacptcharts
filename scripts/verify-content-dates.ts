#!/usr/bin/env tsx
/**
 * Build gate: every rendered route must have an honest content date.
 *
 * Fails if:
 *  - a rendered route (a prerendered .html under .next/server/app) has no entry
 *    in data/content-dates.json,
 *  - any date is unparsable or not in strict YYYY-MM-DD form,
 *  - any date is in the future,
 *  - published > updated.
 *
 * Runs after `next build` (like verify-metadata) so it can enumerate the actual
 * prerendered pages rather than trust a hand-list.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, ".next", "server", "app");
const DATES_FILE = path.join(ROOT, "data", "content-dates.json");

type Entry = { updated: string; published: string };
const dates = JSON.parse(fs.readFileSync(DATES_FILE, "utf8")) as Record<string, Entry>;

const TODAY = new Date().toISOString().slice(0, 10);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseISO(s: string): number | null {
  if (!DATE_RE.test(s)) return null;
  const t = Date.parse(s + "T00:00:00Z");
  return Number.isNaN(t) ? null : t;
}

// Routes that render HTML but are not content pages needing a date.
const EXCLUDE = [
  /^\/dev\//, // dev-only SVG gallery (noindex)
  /^\/_/, // Next.js internal routes: /_not-found/, /_global-error/, etc.
  /^\/404\/?$/,
  /^\/500\/?$/,
];

/** Walk .next/server/app for prerendered *.html and map each to a route. */
function renderedRoutes(): string[] {
  if (!fs.existsSync(APP_DIR)) {
    console.error(`[verify-content-dates] ${APP_DIR} not found — run after next build.`);
    process.exit(1);
  }
  const routes = new Set<string>();
  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) walk(full);
      else if (name.endsWith(".html")) {
        let rel = full.slice(APP_DIR.length).replace(/\\/g, "/").replace(/\.html$/, "");
        // /index -> /, otherwise ensure trailing slash
        if (rel === "/index" || rel === "" || rel === "/") rel = "/";
        else rel = rel.replace(/\/index$/, "") + "/";
        routes.add(rel);
      }
    }
  };
  walk(APP_DIR);
  return [...routes].filter((r) => !EXCLUDE.some((re) => re.test(r)));
}

let failures = 0;
const fail = (m: string) => { failures++; console.log(`  ✗ ${m}`); };

// 1. Validate every entry in the file.
for (const [route, e] of Object.entries(dates)) {
  const u = parseISO(e.updated);
  const p = parseISO(e.published);
  if (u === null) fail(`${route}: updated "${e.updated}" is not a valid YYYY-MM-DD date`);
  if (p === null) fail(`${route}: published "${e.published}" is not a valid YYYY-MM-DD date`);
  if (u !== null && e.updated > TODAY) fail(`${route}: updated "${e.updated}" is in the future (today ${TODAY})`);
  if (p !== null && e.published > TODAY) fail(`${route}: published "${e.published}" is in the future (today ${TODAY})`);
  if (u !== null && p !== null && e.published > e.updated) fail(`${route}: published (${e.published}) > updated (${e.updated})`);
}

// 2. Every rendered content route must have an entry.
const rendered = renderedRoutes();
let missing = 0;
for (const r of rendered) {
  if (!dates[r]) { fail(`rendered route "${r}" has no content-dates entry`); missing++; }
}

console.log(
  `[verify-content-dates] ${Object.keys(dates).length} dated routes; ` +
    `${rendered.length} rendered routes checked; ${missing} missing; ${failures} failure(s)`,
);
process.exit(failures > 0 ? 1 : 0);
