#!/usr/bin/env node
/**
 * QA status + data-endpoint checks against a running server. Reusable.
 * Usage: node scripts/qa/status_check.mjs [--base http://localhost:3200]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const argv = process.argv.slice(2);
const BASE = (argv[argv.indexOf("--base") + 1] || "http://localhost:3200").replace(/\/$/, "");

const data = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "refrigerants.json"), "utf8"));
const precomputed = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "precomputed", "coolprop8-pt.json"), "utf8"));
const nextConfig = fs.readFileSync(path.join(ROOT, "next.config.ts"), "utf8");

const results = { pass: [], fail: [] };
const ok = (name) => results.pass.push(name);
const bad = (name, detail) => results.fail.push(`${name} — ${detail}`);

async function head(url) {
  const r = await fetch(url, { redirect: "manual", headers: { "user-agent": "qa-status" } });
  return { status: r.status, location: r.headers.get("location"), ct: r.headers.get("content-type") || "", body: r };
}
// Follow redirects up to maxHops; returns final status + hop count + chain.
// A trailingSlash 308 (adding "/") is not counted as a content-redirect hop.
async function follow(url, maxHops = 5) {
  let cur = url, hops = 0, contentHops = 0; const chain = [];
  for (let i = 0; i <= maxHops; i++) {
    const r = await head(cur);
    if (r.status >= 300 && r.status < 400 && r.location) {
      const to = new URL(r.location, cur).toString();
      const slashOnly = to.replace(/\/$/, "") === cur.replace(/\/$/, "");
      chain.push(`${r.status}→${new URL(to).pathname}`);
      if (!slashOnly) contentHops++;
      hops++; cur = to; continue;
    }
    return { finalStatus: r.status, finalUrl: cur, hops, contentHops, chain };
  }
  return { finalStatus: 0, finalUrl: cur, hops, contentHops, chain };
}

const GUIDES_410 = [
  "hvac-building-automation-guide", "hvac-commissioning-guide", "hvac-controls-automation-guide",
  "hvac-energy-efficiency-guide", "hvac-energy-management-guide", "hvac-indoor-air-quality-guide",
  "hvac-maintenance-service-guide", "hvac-mechanical-ventilation-guide", "hvac-retrofitting-upgrades-guide",
  "hvac-safety-procedures-guide", "hvac-system-design-guide", "hvac-tools-equipment-guide",
];

// ── 1. 12 removed guides → 410 (with and without trailing slash) ──
for (const g of GUIDES_410) {
  for (const suffix of ["/", ""]) {
    const url = `${BASE}/${g}${suffix}`;
    const f = await follow(url);
    // final must be 410; no-slash form reaches it via a trailingSlash 308 (0 content hops)
    if (f.finalStatus === 410 && f.contentHops === 0) ok(`410 ${g}${suffix || " (no slash)"}`);
    else bad(`410 ${g}${suffix || " (no slash)"}`, `final ${f.finalStatus} [${f.chain.join(" ") || "direct"}]`);
  }
}

// ── 2. next.config redirects reach 200 in one hop ──
const redirectPairs = [...nextConfig.matchAll(/\{\s*source:\s*"([^"]+)",\s*destination:\s*"([^"]+)",\s*(?:statusCode:\s*301|permanent:\s*true)/g)]
  .map((m) => ({ source: m[1], destination: m[2] }))
  .filter((p) => !p.source.includes(":") && !p.destination.startsWith("http")); // skip wildcards + external
for (const { source, destination } of redirectPairs) {
  const f = await follow(`${BASE}${source}`);
  // One content-redirect hop to the destination, ending at 200. (A leading
  // trailingSlash 308 on a no-slash source is normalization, not a content hop.)
  if (f.finalStatus === 200 && f.contentHops === 1) ok(`redirect ${source} → ${new URL(destination, BASE).pathname} [${f.chain.join(" ")}]`);
  else bad(`redirect ${source}`, `final ${f.finalStatus}, ${f.contentHops} content-hops [${f.chain.join(" ")}]`);
}

// ── 3. /refrigerant/r-1233zd-z/ → 301 → r-1233zd-e → 200 ──
{
  const r1 = await head(`${BASE}/refrigerant/r-1233zd-z/`);
  const loc = r1.location ? new URL(r1.location, BASE).pathname : "";
  const f = await follow(`${BASE}/refrigerant/r-1233zd-z/`);
  if (r1.status === 301 && loc === "/refrigerant/r-1233zd-e/" && f.finalStatus === 200) ok("r-1233zd-z → 301 → r-1233zd-e → 200");
  else bad("r-1233zd-z redirect", `first ${r1.status} → ${loc}; final ${f.finalStatus}`);
}

// ── 4. robots.txt ──
{
  const r = await fetch(`${BASE}/robots.txt`);
  const t = await r.text();
  const needs = ["User-Agent: *", "Allow: /", "Disallow: /api/", "Disallow: /dev/", "Sitemap:"];
  const missing = needs.filter((n) => !t.includes(n));
  if (r.status === 200 && missing.length === 0) ok(`robots.txt (has allow /, disallow /api/ + /dev/, sitemap)`);
  else bad("robots.txt", `status ${r.status}; missing: ${missing.join(", ") || "none"}`);
}

// ── 5. sitemap/feed/llms 200 + well-formed + no removed/redirected slugs ──
const REMOVED = [...GUIDES_410, "r-1233zd-z"];
for (const [file, kind] of [["sitemap.xml", "xml"], ["feed.xml", "xml"], ["llms.txt", "txt"], ["llms-full.txt", "txt"]]) {
  const r = await fetch(`${BASE}/${file}`);
  const t = await r.text();
  let wellFormed = t.length > 0;
  if (kind === "xml") wellFormed = /^\s*<\?xml|^\s*<(urlset|rss|feed)/.test(t) && t.trim().endsWith(">");
  const leaked = REMOVED.filter((s) => new RegExp(`/${s}[/"<\\s]`).test(t) || t.includes(`/${s}/`));
  if (r.status === 200 && wellFormed && leaked.length === 0) ok(`${file} 200, well-formed, no removed slugs`);
  else bad(file, `status ${r.status}; wellFormed ${wellFormed}; leaked: ${leaked.join(", ") || "none"}`);
}

// ── 6. data endpoints: json + csv per refrigerant ──
// The generator converts psia→psig directly (gauge = absolute − atmospheric),
// so this comparison matches the site's stored values exactly.
const PSIG_OFFSET = 14.696;
const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;
const psiaToPsig = (p) => round(p - PSIG_OFFSET, 2);
let negGlide = 0, dataFails = 0;
const dataRows = [];
for (const rf of data) {
  const slug = rf.slug;
  // JSON
  const jr = await fetch(`${BASE}/data/refrigerant/${slug}/json/`);
  let jrows = 0, tmin = null, tmax = null, parsedJson = false, kind = "ptChart";
  if (jr.status === 200) {
    try {
      const j = await jr.json();
      // CoolProp fluids expose a tempF-indexed `ptChart`; the manufacturer blends
      // CoolProp can't model expose a PSIG-indexed `ptTable` instead. Discontinued
      // fluids with neither (e.g. r-503) are legitimately chart-less + noindexed.
      let rows = j.ptChart || j.rows || (Array.isArray(j) ? j : j.data) || [];
      if (!rows.length && Array.isArray(j.ptTable)) { rows = j.ptTable; kind = "ptTable"; }
      jrows = rows.length;
      if (rows.length) {
        const ts = rows.map((x) => (typeof x.tempF === "number" ? x.tempF : x.bubbleF)).filter((v) => typeof v === "number");
        if (ts.length) { tmin = Math.min(...ts); tmax = Math.max(...ts); }
      } else {
        kind = "none";
        // An INDEXABLE refrigerant with no PT data at all is a real defect; a
        // noindexed one (pt-data-missing) is expected.
        if (j.indexable !== false) { dataFails++; bad(`ptdata ${slug}`, `indexable but 0 PT rows (no ptChart/ptTable)`); }
      }
      parsedJson = true;
    } catch { dataFails++; bad(`json ${slug}`, "parse error"); }
  } else { dataFails++; bad(`json ${slug}`, `status ${jr.status}`); }
  // CSV
  const cr = await fetch(`${BASE}/data/refrigerant/${slug}/csv/`);
  let crows = 0;
  if (cr.status === 200) { const ct = await cr.text(); crows = ct.trim().split("\n").length - 1; }
  else { dataFails++; bad(`csv ${slug}`, `status ${cr.status}`); }
  if (rf.physical.temperatureGlideF < 0) { negGlide++; bad(`glide ${slug}`, `negative ${rf.physical.temperatureGlideF}`); }
  dataRows.push({ slug, jrows, crows, tmin, tmax, kind });
}
if (negGlide === 0) ok(`no negative glides (${data.length} refrigerants)`);
if (dataFails === 0) ok(`all ${data.length} refrigerant json+csv endpoints 200 + parse`);

// ── 6b. precomputed 6 match coolprop8-pt.json after site rounding ──
let pcMismatch = 0;
for (const slug of Object.keys(precomputed.fluids)) {
  const rf = data.find((x) => x.slug === slug);
  const table = precomputed.fluids[slug].table;
  for (const row of table) {
    const site = rf.ptChart.find((p) => p.tempF === row.tempF);
    if (!site) { pcMismatch++; continue; }
    const expBub = psiaToPsig(row.bubblePsia), expDew = psiaToPsig(row.dewPsia);
    if (Math.abs(site.bubblePsig - expBub) > 0.001 || Math.abs(site.dewPsig - expDew) > 0.001) {
      pcMismatch++;
      if (pcMismatch <= 5) bad(`precomputed ${slug} @${row.tempF}F`, `site ${site.bubblePsig}/${site.dewPsig} vs expected ${expBub}/${expDew}`);
    }
  }
}
if (pcMismatch === 0) ok(`6 precomputed fluids match coolprop8-pt.json after site rounding (psia − 14.696)`);
else bad("precomputed match", `${pcMismatch} row mismatches`);

// ── output ──
console.log(`STATUS CHECK against ${BASE}`);
console.log(`PASS: ${results.pass.length}  FAIL: ${results.fail.length}\n`);
if (results.fail.length) { console.log("FAILURES:"); results.fail.forEach((f) => console.log("  ✗ " + f)); }
else console.log("All status/data checks passed.");
console.log("\nDATA ENDPOINT ROWS (slug: jsonRows/csvRows tempRange):");
for (const d of dataRows) console.log(`  ${d.slug}: ${d.jrows}/${d.crows} rows, ${d.tmin}…${d.tmax}°F${d.kind !== "ptChart" ? ` [${d.kind}]` : ""}`);
fs.writeFileSync(path.join(ROOT, "docs", "seo-fixes", "qa-1-status.json"), JSON.stringify({ base: BASE, pass: results.pass.length, fail: results.fail, dataRows }, null, 2) + "\n");
