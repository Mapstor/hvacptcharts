#!/usr/bin/env node
/**
 * Runtime pre-deployment audit. Hits the live dev server and checks each
 * representative page for: HTTP 200, title, description, canonical, OG/Twitter,
 * JSON-LD entity types, h1 presence. Outputs a coverage matrix.
 */

const BASE = "http://localhost:3003";

const PAGES = [
  // Top-level
  { url: "/", category: "homepage" },
  { url: "/about-us/", category: "about" },
  { url: "/contact-us/", category: "contact" },
  // Hubs
  { url: "/pt-charts-tools-hub/", category: "hub" },
  { url: "/calculators-hub/", category: "hub" },
  { url: "/guides-hub/", category: "hub" },
  // Calculators (sample 3)
  { url: "/pt-calculator/", category: "calculator" },
  { url: "/superheat-calculator/", category: "calculator" },
  { url: "/refrigerant-charge-calculator/", category: "calculator" },
  // What-pressure (sample 3)
  { url: "/what-pressure-should-410a/", category: "what-pressure" },
  { url: "/what-pressure-should-r22/", category: "what-pressure" },
  { url: "/what-pressure-should-r744/", category: "what-pressure" },
  // Comparisons (sample 3)
  { url: "/r-32-vs-r-410a/", category: "comparison" },
  { url: "/r-22-vs-r-410a/", category: "comparison" },
  { url: "/r-1234yf-vs-r-134a/", category: "comparison" },
  // Refrigerant detail (sample 3)
  { url: "/refrigerant/r-410a/", category: "refrigerant" },
  { url: "/refrigerant/r-32/", category: "refrigerant" },
  { url: "/refrigerant/r-1150/", category: "refrigerant" },
  // Reference + long-form
  { url: "/refrigerant-safety-classifications/", category: "reference" },
  { url: "/refrigerant-gwp-rankings/", category: "reference" },
  { url: "/pt-chart-guide/", category: "long-form" },
  { url: "/superheat-subcooling-fundamentals/", category: "long-form" },
];

function extract(html, regex, idx = 1) {
  const m = regex.exec(html);
  return m ? m[idx] : null;
}

function extractAll(html, regex) {
  const out = [];
  let m;
  while ((m = regex.exec(html)) !== null) out.push(m[1]);
  return out;
}

function getJsonLdTypes(html) {
  const types = new Set();
  const blocks = extractAll(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  for (const raw of blocks) {
    try {
      const parsed = JSON.parse(raw.replace(/\\u003c/g, "<"));
      const walk = (node) => {
        if (Array.isArray(node)) node.forEach(walk);
        else if (node && typeof node === "object") {
          if (typeof node["@type"] === "string") types.add(node["@type"]);
          if (Array.isArray(node["@graph"])) node["@graph"].forEach(walk);
          if (node.mainEntity) walk(node.mainEntity);
          if (node.potentialAction) walk(node.potentialAction);
          if (Array.isArray(node.itemListElement)) node.itemListElement.forEach(walk);
        }
      };
      walk(parsed);
    } catch (e) {
      types.add(`PARSE_ERROR(${e.message.slice(0, 40)})`);
    }
  }
  return [...types].sort();
}

async function auditOne(p) {
  const t0 = Date.now();
  let res, html;
  try {
    res = await fetch(`${BASE}${p.url}`, { redirect: "manual" });
    html = await res.text();
  } catch (e) {
    return { ...p, error: e.message };
  }
  const dur = Date.now() - t0;
  const status = res.status;
  const title = extract(html, /<title[^>]*>([^<]*)<\/title>/);
  const description = extract(html, /<meta\s+name="description"\s+content="([^"]*)"/);
  const canonical = extract(html, /<link\s+rel="canonical"\s+href="([^"]*)"/);
  const ogTitle = extract(html, /<meta\s+property="og:title"\s+content="([^"]*)"/);
  const ogImage = extract(html, /<meta\s+property="og:image"\s+content="([^"]*)"/);
  const twitterCard = extract(html, /<meta\s+name="twitter:card"\s+content="([^"]*)"/);
  const h1Count = (html.match(/<h1\b/g) || []).length;
  const jsonLdTypes = getJsonLdTypes(html);
  return { ...p, status, dur, title, description, canonical, ogTitle, ogImage, twitterCard, h1Count, jsonLdTypes };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
for (const p of PAGES) {
  const r = await auditOne(p);
  results.push(r);
  process.stdout.write(`  ${r.status === 200 ? "[200]" : "[" + r.status + "]"} ${p.url} (${r.dur || "?"}ms)\n`);
  // Space requests so Turbopack's first-compile queue doesn't OOM the dev server.
  await sleep(800);
}

// Coverage matrix
console.log("\n=== Coverage matrix ===\n");
const rows = [
  ["url", "200", "title", "desc", "canonical", "og:title", "og:image", "twitter", "h1", "jsonld count"],
];
for (const r of results) {
  rows.push([
    r.url,
    r.status === 200 ? "✓" : "✗",
    r.title ? "✓" : "✗",
    r.description ? "✓" : "✗",
    r.canonical ? "✓" : "✗",
    r.ogTitle ? "✓" : "✗",
    r.ogImage ? "✓" : "✗",
    r.twitterCard ? "✓" : "✗",
    String(r.h1Count),
    String(r.jsonLdTypes?.length || 0),
  ]);
}
// Pretty-print
const widths = rows[0].map((_, ci) => Math.max(...rows.map((r) => String(r[ci]).length)));
for (const row of rows) {
  console.log(row.map((c, i) => String(c).padEnd(widths[i])).join("  "));
}

// Per-page JSON-LD types
console.log("\n=== JSON-LD entity types per page ===\n");
for (const r of results) {
  console.log(`${r.url}\n   types: [${(r.jsonLdTypes || []).join(", ")}]`);
}

// Summary
const failures = results.filter((r) => r.status !== 200);
const noCanonical = results.filter((r) => !r.canonical);
const noOg = results.filter((r) => !r.ogTitle);
const noOgImage = results.filter((r) => !r.ogImage);
const noTwitter = results.filter((r) => !r.twitterCard);
const noJsonLd = results.filter((r) => (r.jsonLdTypes || []).length === 0);

console.log("\n=== Summary ===\n");
console.log(`Visited: ${results.length}`);
console.log(`HTTP non-200: ${failures.length} (${failures.map(r=>r.url).join(", ")})`);
console.log(`Missing canonical: ${noCanonical.length} (${noCanonical.map(r=>r.url).join(", ")})`);
console.log(`Missing og:title: ${noOg.length} (${noOg.map(r=>r.url).join(", ")})`);
console.log(`Missing og:image: ${noOgImage.length} (${noOgImage.map(r=>r.url).join(", ")})`);
console.log(`Missing twitter card: ${noTwitter.length} (${noTwitter.map(r=>r.url).join(", ")})`);
console.log(`Missing JSON-LD: ${noJsonLd.length} (${noJsonLd.map(r=>r.url).join(", ")})`);
