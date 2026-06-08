#!/usr/bin/env node
/**
 * Static-build SEO audit. Reads every prerendered .html under .next/server/app
 * and checks for title, description, canonical, og:title, og:description,
 * og:image, twitter:card, h1, JSON-LD entity types. Rock-solid because it
 * doesn't depend on a live dev server.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const BUILD_DIR = path.join(ROOT, ".next", "server", "app");

function findHtml(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...findHtml(full));
    else if (ent.isFile() && ent.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function urlOf(filepath) {
  const rel = path.relative(BUILD_DIR, filepath);
  let url = "/" + rel.replace(/\.html$/, "");
  if (url === "/index") return "/";
  if (!url.endsWith("/")) url += "/";
  return url;
}

const SKIP = [/^\/_not-found\/?$/, /^\/_global-error\/?$/, /^\/dev\//, /^\/data\/refrigerant\//];

function extract(html, regex) {
  const m = regex.exec(html);
  return m ? m[1] : null;
}
function extractAll(html, regex) {
  const out = [];
  let m;
  while ((m = regex.exec(html)) !== null) out.push(m[1]);
  return out;
}
function jsonLdTypes(html) {
  const types = new Set();
  const blocks = extractAll(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  for (const raw of blocks) {
    try {
      const parsed = JSON.parse(raw.replace(/\\u003c/g, "<"));
      const walk = (n) => {
        if (Array.isArray(n)) n.forEach(walk);
        else if (n && typeof n === "object") {
          if (typeof n["@type"] === "string") types.add(n["@type"]);
          if (Array.isArray(n["@graph"])) n["@graph"].forEach(walk);
          if (n.mainEntity) walk(n.mainEntity);
          if (n.potentialAction) walk(n.potentialAction);
          if (Array.isArray(n.itemListElement)) n.itemListElement.forEach(walk);
        }
      };
      walk(parsed);
    } catch { /* ignore */ }
  }
  return [...types].sort();
}

const files = findHtml(BUILD_DIR).sort();
const audit = [];
for (const f of files) {
  const url = urlOf(f);
  if (SKIP.some((p) => p.test(url))) continue;
  const html = fs.readFileSync(f, "utf8");
  audit.push({
    url,
    title: extract(html, /<title[^>]*>([^<]*)<\/title>/),
    description: extract(html, /<meta\s+name="description"\s+content="([^"]*)"/),
    canonical: extract(html, /<link\s+rel="canonical"\s+href="([^"]*)"/),
    ogTitle: extract(html, /<meta\s+property="og:title"\s+content="([^"]*)"/),
    ogImage: extract(html, /<meta\s+property="og:image"\s+content="([^"]*)"/),
    ogType: extract(html, /<meta\s+property="og:type"\s+content="([^"]*)"/),
    twitterCard: extract(html, /<meta\s+name="twitter:card"\s+content="([^"]*)"/),
    twitterImage: extract(html, /<meta\s+name="twitter:image"\s+content="([^"]*)"/),
    h1Count: (html.match(/<h1\b/g) || []).length,
    schemas: jsonLdTypes(html),
  });
}

// Summary
const total = audit.length;
const noTitle = audit.filter((a) => !a.title);
const noDesc = audit.filter((a) => !a.description);
const noCanon = audit.filter((a) => !a.canonical);
const noOgT = audit.filter((a) => !a.ogTitle);
const noOgI = audit.filter((a) => !a.ogImage);
const noTw = audit.filter((a) => !a.twitterCard);
const noTwI = audit.filter((a) => !a.twitterImage);
const noH1 = audit.filter((a) => a.h1Count === 0);
const multiH1 = audit.filter((a) => a.h1Count > 1);
const noLd = audit.filter((a) => a.schemas.length === 0);

console.log(`\n=== Static-HTML SEO audit ===\n`);
console.log(`Total pages audited: ${total}\n`);
console.log(`Coverage:`);
console.log(`  title:           ${total - noTitle.length}/${total}`);
console.log(`  description:     ${total - noDesc.length}/${total}`);
console.log(`  canonical:       ${total - noCanon.length}/${total}`);
console.log(`  og:title:        ${total - noOgT.length}/${total}`);
console.log(`  og:image:        ${total - noOgI.length}/${total}`);
console.log(`  twitter:card:    ${total - noTw.length}/${total}`);
console.log(`  twitter:image:   ${total - noTwI.length}/${total}`);
console.log(`  h1 (exactly 1):  ${total - noH1.length - multiH1.length}/${total}`);
console.log(`  JSON-LD:         ${total - noLd.length}/${total}`);
console.log();

function listIf(label, arr) {
  if (arr.length === 0) return;
  console.log(`${label} (${arr.length}):`);
  for (const a of arr.slice(0, 8)) console.log(`  - ${a.url}`);
  if (arr.length > 8) console.log(`  ...and ${arr.length - 8} more`);
  console.log();
}
listIf("Missing title", noTitle);
listIf("Missing description", noDesc);
listIf("Missing canonical", noCanon);
listIf("Missing og:title", noOgT);
listIf("Missing og:image", noOgI);
listIf("Missing twitter:card", noTw);
listIf("Missing twitter:image", noTwI);
listIf("Missing h1", noH1);
listIf("Multiple h1", multiH1);
listIf("Missing JSON-LD", noLd);

// Detailed sample
console.log(`\n=== Sample (first 5 pages) ===`);
for (const a of audit.slice(0, 5)) {
  console.log(`\n${a.url}`);
  console.log(`  title:        ${a.title}`);
  console.log(`  canonical:    ${a.canonical}`);
  console.log(`  og:title:     ${a.ogTitle}`);
  console.log(`  og:image:     ${a.ogImage}`);
  console.log(`  twitter:card: ${a.twitterCard}`);
  console.log(`  twitter:img:  ${a.twitterImage}`);
  console.log(`  h1 count:     ${a.h1Count}`);
  console.log(`  schemas:      [${a.schemas.join(", ")}]`);
}
