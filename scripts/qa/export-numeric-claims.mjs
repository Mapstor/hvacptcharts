#!/usr/bin/env node
/**
 * QA export (Task 21): harvest every regulatory / numeric claim sentence from the
 * BUILT HTML and write a deduplicated, route-counted list.
 *
 * A sentence is kept when it contains any of the regulatory keywords AND also a
 * digit or the word "banned". Sentences are deduplicated after normalizing
 * refrigerant designations to "R-X" and collapsing whitespace; the report shows
 * how many distinct routes each unique sentence appears on, highest first.
 *
 *   node scripts/qa/export-numeric-claims.mjs [appDir]
 *
 * Output: scripts/qa/reports/regulatory-numeric-claims.txt
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const ROOT = process.cwd();
const APP_DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, ".next", "server", "app");
const OUT = path.join(ROOT, "scripts", "qa", "reports", "regulatory-numeric-claims.txt");
const MAX_LINES = 250;

/* keyword tests (mixed case-sensitivity to avoid matching inside words) */
const KEYWORDS = [
  /\bSNAP\b/,
  /F-Gas/i,
  /\bEU\b/,
  /European/i,
  /banned/i,
  /\bban\b/i,
  /prohibit/i,
  /phase-out/i,
  /phased out/i,
  /phase-down/i,
  /charge limit/i,
  /charge size/i,
  /AIM Act/i,
  /Montreal/i,
  /Kigali/i,
  /UL 60335/i,
  /ASHRAE 15/i,
];
const hasKeyword = (s) => KEYWORDS.some((re) => re.test(s));
const qualifies = (s) => /\d/.test(s) || /banned/i.test(s);

/* refrigerant designation → "R-X" (for dedup + display) */
function normalizeRefrigerants(s) {
  return s
    .replace(/\b(?:HFC|CFC|HCFC|HFO|PFC)-\d{1,4}[a-z]{0,3}\b/gi, "R-X")
    .replace(/\bR-?\d{1,4}[A-Za-z]{0,3}\b/g, "R-X");
}
const collapse = (s) => s.replace(/\s+/g, " ").trim();

/* visible text extraction (block elements insert boundaries) */
const BLOCK_TAGS = new Set(["p","div","section","article","li","td","th","tr","h1","h2","h3","h4","h5","h6","ul","ol","dl","dt","dd","header","footer","main","nav","details","summary","figcaption","blockquote","table","br"]);
function blockText(node, out) {
  if (!node) return;
  if (node.type === "text") { out.push(node.data ?? ""); return; }
  const name = typeof node.name === "string" ? node.name.toLowerCase() : "";
  if (name === "script" || name === "style") return;
  const block = BLOCK_TAGS.has(name);
  if (block) out.push("\n");
  for (const c of node.children ?? []) blockText(c, out);
  if (block) out.push("\n");
}
function visibleText(html) {
  const $ = cheerio.load(html);
  $("script,style").remove();
  const acc = [];
  blockText($("body")[0], acc);
  return acc.join("");
}

/* sentence splitter — protects common abbreviations from false splits */
const ABBR = [["U.S.C.", "U∙S∙C∙"], ["U.S.", "U∙S∙"], ["e.g.", "e∙g∙"], ["i.e.", "i∙e∙"], ["No.", "No∙"], ["cf.", "cf∙"], ["Fig.", "Fig∙"], ["vs.", "vs∙"], ["approx.", "approx∙"]];
function sentences(text) {
  return text.split(/\n+/).flatMap((block) => {
    let b = block;
    for (const [a, p] of ABBR) b = b.split(a).join(p);
    const parts = b.split(/(?<=[.?!])\s+(?=[A-Z0-9"“(])/);
    return parts.map((p) => {
      for (const [a, ph] of ABBR) p = p.split(ph).join(a);
      return collapse(p);
    });
  }).filter((s) => s.length >= 12);
}

function routeOf(file) {
  let rel = path.relative(APP_DIR, file).split(path.sep).join("/").replace(/\.html$/, "");
  if (rel === "index") return "/";
  rel = rel.replace(/\/index$/, "");
  return "/" + rel + "/";
}

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = path.relative(APP_DIR, full).split(path.sep).join("/");
    if (rel === "dev" || rel.startsWith("dev/")) continue;
    if (e.isDirectory()) walk(full, acc);
    else if (e.isFile() && e.name.endsWith(".html")) acc.push(full);
  }
  return acc;
}

if (!fs.existsSync(APP_DIR)) {
  console.error(`[export-numeric-claims] .next/server/app not found at ${APP_DIR} — run after \`next build\``);
  process.exit(1);
}

/** normalized sentence -> Set<route> */
const byNorm = new Map();
let scanned = 0;

for (const file of walk(APP_DIR, [])) {
  scanned++;
  const route = routeOf(file);
  const text = visibleText(fs.readFileSync(file, "utf8"));
  const seenInFile = new Set();
  for (const s of sentences(text)) {
    if (!hasKeyword(s) || !qualifies(s)) continue;
    const norm = collapse(normalizeRefrigerants(s));
    if (seenInFile.has(norm)) continue; // count each route once per unique sentence
    seenInFile.add(norm);
    if (!byNorm.has(norm)) byNorm.set(norm, new Set());
    byNorm.get(norm).add(route);
  }
}

const rows = [...byNorm.entries()]
  .map(([sentence, routes]) => ({ sentence, count: routes.size }))
  .sort((a, b) => b.count - a.count || a.sentence.localeCompare(b.sentence));

const total = rows.length;
const shown = rows.slice(0, MAX_LINES);

const header = [
  `# Regulatory / numeric claim sentences harvested from built HTML`,
  `# Scanned ${scanned} HTML files. ${total} unique sentences (after R-X normalization + whitespace collapse).`,
  `# Format: <route-count>\\t<sentence>. Sorted by route count, highest first. Showing ${shown.length} of ${total}.`,
  ``,
].join("\n");
const body = shown.map((r) => `${r.count}\t${r.sentence}`).join("\n");
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, header + body + "\n");

console.log(`[export-numeric-claims] scanned ${scanned} HTML files; ${total} unique sentences; wrote ${shown.length} to ${path.relative(ROOT, OUT)}`);
