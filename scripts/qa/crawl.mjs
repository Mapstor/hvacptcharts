#!/usr/bin/env node
/**
 * QA crawler (server HTML only — no JS execution). Reusable across QA batches.
 *
 * Seeds: "/" plus every URL in sitemap.xml. Follows every same-host <a href>
 * (fragments stripped), following up to 5 redirect hops. Records per URL:
 *   status, redirect chain, final URL, canonical, robots + googlebot meta,
 *   X-Robots-Tag header, title/description length, H1 count, visible "Updated"
 *   date, JSON-LD (parses?, @types, dateModified), internal links out/in, words.
 *
 * Writes docs/seo-fixes/<out>-crawl.csv and prints the check a–f failures.
 *
 * Usage: node scripts/qa/crawl.mjs [--base http://localhost:3200] [--out qa-1]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");

const argv = process.argv.slice(2);
const getArg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const BASE = getArg("--base", "http://localhost:3200").replace(/\/$/, "");
const OUT = getArg("--out", "qa-1");
const HOST = new URL(BASE).host;
const MAX_HOPS = 5;

// First line: the Node version this crawl ran under (coverage count is asserted
// against a floor once the crawl completes — see the end of the file).
console.log(`[crawl] node ${process.version} — crawling from ${BASE}`);

const contentDates = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "content-dates.json"), "utf8"));

// Production hosts are treated as internal and rewritten to BASE so the crawl
// hits the local server (sitemap/canonical/JSON-LD emit absolute prod URLs).
const PROD_HOSTS = new Set(["hvacptcharts.com", "www.hvacptcharts.com"]);
const proto = new URL(BASE).protocol;
const norm = (u) => {
  let x; try { x = new URL(u, BASE); } catch { return null; }
  x.hash = "";
  x.search = ""; // query variants (e.g. ?refrigerant=x on a static calculator) are the same page
  if (PROD_HOSTS.has(x.host)) { x.protocol = proto; x.host = HOST; }
  return x.toString();
};
const sameHost = (u) => { try { return u != null && new URL(u).host === HOST; } catch { return false; } };
const toPath = (u) => { try { return new URL(u).pathname; } catch { return u; } };

async function follow(url) {
  const chain = [];
  let cur = url, res = null, hops = 0;
  while (hops <= MAX_HOPS) {
    res = await fetch(cur, { redirect: "manual", headers: { "user-agent": "qa-crawler" } });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      const loc = norm(new URL(res.headers.get("location"), cur).toString());
      chain.push(`${res.status}→${toPath(loc)}`);
      cur = loc; hops++; continue;
    }
    break;
  }
  return { res, finalUrl: cur, chain, hops };
}

// ── sitemap seeds ──
const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
const sitemapEntries = [...sm.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => {
  const loc = (m[1].match(/<loc>(.*?)<\/loc>/) || [])[1];
  const lastmod = (m[1].match(/<lastmod>(.*?)<\/lastmod>/) || [])[1] || "";
  return { loc: loc ? norm(loc) : null, lastmod };
}).filter((e) => e.loc);
const sitemapSet = new Set(sitemapEntries.map((e) => e.loc));
const sitemapLastmod = new Map(sitemapEntries.map((e) => [e.loc, e.lastmod]));

const records = new Map();     // requestedUrl → record
const queue = [norm(`${BASE}/`), ...sitemapEntries.map((e) => e.loc)];
const enqueued = new Set(queue);

function extract(html, headers) {
  const $ = cheerio.load(html);
  const title = $("title").first().text().trim();
  const desc = $('meta[name="description"]').attr("content") || "";
  const canonical = $('link[rel="canonical"]').attr("href") || "";
  const robots = $('meta[name="robots"]').attr("content") || "";
  const googlebot = $('meta[name="googlebot"]').attr("content") || "";
  const h1 = $("h1").length;
  // JSON-LD
  const types = new Set(); let jsonldParses = true, dateModified = "";
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const j = JSON.parse($(el).text());
      const walk = (n) => {
        if (Array.isArray(n)) n.forEach(walk);
        else if (n && typeof n === "object") {
          if (n["@type"]) [].concat(n["@type"]).forEach((t) => types.add(t));
          if (n.dateModified && !dateModified) dateModified = n.dateModified;
          Object.values(n).forEach(walk);
        }
      };
      walk(j);
    } catch { jsonldParses = false; }
  });
  // out links (same-host, fragment-stripped)
  const outLinks = new Set();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    const abs = norm(href);
    if (abs && sameHost(abs)) outLinks.add(abs);
  });
  // Links inside the crawl-nav blocks (A–Z lists, per-template "Related" blocks
  // marked data-crawl-block). Check (i) requires each to resolve 200-in-one-hop.
  const blockLinks = new Set();
  $("[data-crawl-block] a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    const abs = norm(href);
    if (abs && sameHost(abs)) blockLinks.add(abs);
  });
  // visible text (drop scripts/styles)
  $("script, style, template, noscript").remove();
  const body = $("body").text().replace(/\s+/g, " ").trim();
  const updated = (body.match(/Updated\s+([A-Z][a-z]+ \d{1,2}, \d{4})/) || [])[1] || "";
  const words = body ? body.split(/\s+/).length : 0;
  // blank-value check: a dash immediately BEFORE a unit (a missing computed value
  // like "— PSIG" / "— °F"), or the literal tokens NaN / [object Object]. A dash
  // AFTER a value ("22°F — …") is prose punctuation and is deliberately not matched.
  const blanks = [];
  const unitRe = /(?:[—–]\s*(?:PSIG|psig|psia|°F|°C|inHg)\b)|\bNaN\b|\[object Object\]/g;
  let mm; while ((mm = unitRe.exec(body)) !== null) blanks.push(body.slice(Math.max(0, mm.index - 30), mm.index + 12).trim());
  return { title, desc, canonical, robots, googlebot, h1, jsonldParses, types: [...types], dateModified, outLinks: [...outLinks], blockLinks: [...blockLinks], updated, words, xRobots: headers.get("x-robots-tag") || "", blanks };
}

let processed = 0;
while (queue.length) {
  const url = queue.shift();
  if (records.has(url)) continue;
  const { res, finalUrl, chain, hops } = await follow(url);
  const initialStatus = chain.length ? parseInt(chain[0]) : res.status;
  const ct = res.headers.get("content-type") || "";
  const rec = { url, initialStatus, finalStatus: res.status, chain, finalUrl, hops, ct, isSitemap: sitemapSet.has(url) };
  if (res.status === 200 && ct.includes("text/html")) {
    Object.assign(rec, extract(await res.text(), res.headers));
    for (const l of rec.outLinks) if (!enqueued.has(l)) { enqueued.add(l); queue.push(l); }
    // also crawl the final URL of any redirect for content
  } else {
    rec.outLinks = [];
    rec.blockLinks = [];
  }
  records.set(url, rec);
  if (finalUrl !== url && !enqueued.has(finalUrl)) { enqueued.add(finalUrl); queue.push(finalUrl); }
  processed++;
  if (processed % 40 === 0) process.stderr.write(`  crawled ${processed}…\n`);
}

// inbound counts (over 200 HTML pages' outLinks)
const inbound = new Map();
for (const r of records.values()) for (const l of (r.outLinks || [])) inbound.set(l, (inbound.get(l) || 0) + 1);

// ── CSV ──
const cols = ["url", "initialStatus", "finalStatus", "redirectChain", "finalUrl", "canonical", "robots", "googlebot", "xRobotsTag", "titleLen", "descLen", "h1Count", "updatedDate", "jsonldParses", "jsonldTypes", "jsonldDateModified", "linksOut", "linksIn", "wordCount", "isSitemap"];
const esc = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const rows = [cols.join(",")];
for (const r of [...records.values()].sort((a, b) => a.url.localeCompare(b.url))) {
  rows.push([r.url, r.initialStatus, r.finalStatus, r.chain.join(" "), r.finalUrl, r.canonical, r.robots, r.googlebot, r.xRobots, (r.title || "").length, (r.desc || "").length, r.h1 ?? "", r.updated || "", r.jsonldParses ?? "", (r.types || []).join("|"), r.dateModified || "", (r.outLinks || []).length, inbound.get(r.url) || 0, r.words ?? "", r.isSitemap].map(esc).join(","));
}
const outCsv = path.join(ROOT, "docs", "seo-fixes", `${OUT}-crawl.csv`);
fs.writeFileSync(outCsv, rows.join("\n") + "\n");

// ── checks a–i ──
const fail = { a: [], b: [], c: [], d: [], e: [], f: [], g: [], h: [], i: [] };
const cdKey = (u) => { const p = toPath(u); return p.endsWith("/") ? p : p + "/"; };
// Indexable = self-canonical 200 HTML, not robots-noindex, not a dev/internal
// path. NB: unlike check (c) — which additionally requires !isSitemap to find
// pages MISSING from the sitemap — g/h target the real indexable pages, which
// ARE in the sitemap, so isSitemap must NOT be excluded here.
const isIndexable = (r) =>
  r.finalStatus === 200 && (r.ct || "").includes("text/html") &&
  !/noindex/i.test(r.robots || "") && r.url === r.finalUrl && !/^\/(dev|_)/.test(toPath(r.url));
for (const r of records.values()) {
  // (a) internal links must resolve to a 200 in one hop (no 3xx/404/410/missing slash)
  for (const l of (r.outLinks || [])) {
    const t = records.get(l);
    if (t && t.initialStatus !== 200) fail.a.push(`${toPath(r.url)} → ${toPath(l)} [${t.initialStatus}${t.chain.length ? " " + t.chain.join(" ") : ""}]`);
  }
  // (i) links inside the new nav/related blocks must also resolve 200-in-one-hop
  for (const l of (r.blockLinks || [])) {
    const t = records.get(l);
    if (t && t.initialStatus !== 200) fail.i.push(`${toPath(r.url)} (block) → ${toPath(l)} [${t.initialStatus}${t.chain.length ? " " + t.chain.join(" ") : ""}]`);
  }
  if (r.isSitemap) {
    // (b) sitemap URL: 200, self-canonical, not noindex, has content-dates, lastmod==updated
    const p = cdKey(r.url);
    const reasons = [];
    if (r.finalStatus !== 200) reasons.push(`status ${r.finalStatus}`);
    if (r.canonical && norm(r.canonical) !== r.url) reasons.push(`canonical=${toPath(r.canonical)}`);
    if (/noindex/i.test(r.robots)) reasons.push(`robots noindex (${r.robots})`);
    if (!contentDates[p]) reasons.push("no content-dates entry");
    else {
      const lm = (sitemapLastmod.get(r.url) || "").slice(0, 10);
      if (lm && lm !== contentDates[p].updated) reasons.push(`lastmod ${lm} != updated ${contentDates[p].updated}`);
    }
    if (reasons.length) fail.b.push(`${toPath(r.url)}: ${reasons.join("; ")}`);
    // (f) orphan: zero inbound
    if (!(inbound.get(r.url) > 0)) fail.f.push(toPath(r.url));
    // (d) JSON-LD dateModified vs content-dates
    if (contentDates[p] && r.dateModified && r.dateModified.slice(0, 10) !== contentDates[p].updated) fail.d.push(`${toPath(r.url)}: jsonld ${r.dateModified.slice(0,10)} != updated ${contentDates[p].updated}`);
  }
  // (c) indexable 200 page not in sitemap
  if (r.finalStatus === 200 && (r.ct || "").includes("text/html") && !r.isSitemap && !/noindex/i.test(r.robots || "") && r.url === r.finalUrl) {
    const p = toPath(r.url);
    if (!/^\/(dev|_)/.test(p)) fail.c.push(p);
  }
  // (d2) JSON-LD parse failure on any 200 html
  if (r.finalStatus === 200 && (r.ct || "").includes("text/html") && r.jsonldParses === false) fail.d.push(`${toPath(r.url)}: JSON-LD parse error`);
  // (e) blank computed values
  if (r.blanks && r.blanks.length) fail.e.push(`${toPath(r.url)}: ${[...new Set(r.blanks)].slice(0,3).join(" | ")}`);
}
// (g) the homepage and the PT hub must each link EVERY indexable refrigerant page
const indexableRefrUrls = new Set(
  [...records.values()].filter((r) => isIndexable(r) && toPath(r.url).startsWith("/refrigerant/")).map((r) => r.url),
);
for (const [label, u] of [["/", norm(`${BASE}/`)], ["/pt-charts-tools-hub/", norm(`${BASE}/pt-charts-tools-hub/`)]]) {
  const rec = records.get(u);
  if (!rec || rec.finalStatus !== 200) { fail.g.push(`${label}: not reachable (status ${rec ? rec.finalStatus : "missing"})`); continue; }
  const linked = new Set(rec.outLinks || []);
  const missing = [...indexableRefrUrls].filter((x) => !linked.has(x)).map(toPath).sort();
  if (missing.length) fail.g.push(`${label}: server HTML missing links to ${missing.length}/${indexableRefrUrls.size} indexable refrigerant pages (${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ", …" : ""})`);
}

// (h) every indexable refrigerant page needs >= 3 inbound internal links
const refrInbound = [...indexableRefrUrls].map((u) => ({ p: toPath(u), n: inbound.get(u) || 0 }));
for (const { p, n } of [...refrInbound].sort((a, b) => a.n - b.n)) if (n < 3) fail.h.push(`${p}: ${n} inbound`);
const inCounts = refrInbound.map((x) => x.n).sort((a, b) => a - b);
const medianOf = (arr) => (arr.length ? (arr.length % 2 ? arr[(arr.length - 1) / 2] : (arr[arr.length / 2 - 1] + arr[arr.length / 2]) / 2) : 0);
const refrInboundStats = { pages: inCounts.length, min: inCounts[0] ?? 0, median: medianOf(inCounts), max: inCounts.at(-1) ?? 0 };

const uniq = (a) => [...new Set(a)];
for (const k of Object.keys(fail)) fail[k] = uniq(fail[k]);

const summary = {
  base: BASE, urlsCrawled: records.size, sitemapUrls: sitemapSet.size,
  refrigerantInbound: refrInboundStats,
  checks: Object.fromEntries(Object.entries(fail).map(([k, v]) => [k, v.length])),
  fail,
};
fs.writeFileSync(path.join(ROOT, "docs", "seo-fixes", `${OUT}-crawl-findings.json`), JSON.stringify(summary, null, 2) + "\n");

// A crawl that visited almost nothing (discovery/seeding collapsed, or the
// sitemap itself is near-empty) must fail rather than report six clean checks.
const CRAWL_FLOOR = Math.max(100, sitemapSet.size - 5);
const belowFloor = records.size < CRAWL_FLOOR || sitemapSet.size < 100;
console.log(`[crawl] node ${process.version} — crawled ${records.size} URLs, ${sitemapSet.size} in sitemap (floor ${CRAWL_FLOOR}). CSV → ${path.relative(ROOT, outCsv)}`);
console.log(`[inbound] indexable /refrigerant/ pages: ${refrInboundStats.pages}; min ${refrInboundStats.min}, median ${refrInboundStats.median}, max ${refrInboundStats.max} inbound internal links`);
for (const [k, label] of [["a", "internal link not 200-in-one-hop"], ["b", "sitemap URL issues"], ["c", "indexable 200 missing from sitemap"], ["d", "JSON-LD parse / dateModified mismatch"], ["e", "blank computed values"], ["f", "sitemap orphans (0 inbound)"], ["g", "homepage/PT-hub missing indexable refrigerant links"], ["h", "indexable refrigerant page with <3 inbound links"], ["i", "new-block link not 200-in-one-hop"]]) {
  console.log(`\n[${k}] ${label}: ${fail[k].length}`);
  for (const line of fail[k].slice(0, 40)) console.log(`   ${line}`);
  if (fail[k].length > 40) console.log(`   … +${fail[k].length - 40} more`);
}

const totalFindings = Object.values(fail).reduce((s, a) => s + a.length, 0);
if (belowFloor) {
  console.error(`\n[crawl] FAIL: crawled too little (${records.size} URLs < floor ${CRAWL_FLOOR}, or sitemap ${sitemapSet.size} < 100). Discovery collapsed — refusing to report a clean crawl.`);
  process.exit(1);
}
process.exit(totalFindings > 0 ? 1 : 0);
