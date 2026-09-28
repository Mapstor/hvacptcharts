#!/usr/bin/env tsx
/**
 * Build gate (after validate-schema): the regulatory engine must reproduce the
 * verified fixture counts, and no rendered page may contain a banned regulatory
 * phrasing. Floor = 60 refrigerants evaluated.
 *
 * Runs post-`next build`, so it also scans .next/server/app HTML for the forbidden
 * patterns (report mode lists every hit; fail mode exits non-zero on any) and
 * checks that every regulated / ODS refrigerant page cites a regulatory source.
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { banner } from "./build-guard";
import { refrigerants, getRefrigerant } from "@/data/refrigerants";
import {
  restrictions,
  ods,
  isRegulated,
  regulatoryClass,
  AIM_SOURCE_URL,
} from "@/lib/us-regulation";

const ROOT = process.cwd();
const APP_DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, ".next", "server", "app");

const failures: string[] = [];
const fail = (m: string) => failures.push(m);

/* ─────────────────────────── 1. fixture counts ──────────────────────────── */

const EXPECTED_COUNT: Record<string, number> = {
  "r-404a": 38, "r-448a": 29, "r-410a": 35, "r-513a": 13, "r-32": 13,
  "r-454c": 0, "r-455a": 0, "r-22": 0, "r-1234yf": 0, "r-290": 0,
  "r-744": 0, "r-717": 0, "r-500": 0,
};
const paras = (slug: string): Set<string> => {
  const r = getRefrigerant(slug);
  return r ? new Set(restrictions(r).map((a) => a.para)) : new Set();
};
for (const [slug, exp] of Object.entries(EXPECTED_COUNT)) {
  const r = getRefrigerant(slug);
  if (!r) {
    if (slug === "r-500") continue; // r-500 is optional per the fixture spec
    fail(`fixture: ${slug} not in dataset`);
    continue;
  }
  const n = restrictions(r).length;
  if (n !== exp) fail(`fixture: ${slug} restrictions = ${n}, expected ${exp}`);
}
// inclusion / exclusion
const incl = (slug: string, ps: string[]) => ps.forEach((p) => { if (!paras(slug).has(p)) fail(`fixture: ${slug} should include ${p}`); });
const excl = (slug: string, ps: string[]) => ps.forEach((p) => { if (paras(slug).has(p)) fail(`fixture: ${slug} should NOT include ${p}`); });
incl("r-404a", ["(a)(4)", "(a)(7)", "(c)(8)", "(c)(9)(i)", "(c)(11)(i)", "(c)(12)(i)", "(c)(14)"]);
incl("r-448a", ["(c)(9)(i)", "(c)(11)(ii)", "(c)(12)(ii)"]);
excl("r-448a", ["(c)(11)(i)", "(c)(12)(i)", "(a)(7)", "(c)(8)"]);
incl("r-410a", ["(a)(1)", "(c)(1)", "(c)(2)", "(a)(8)(ii)", "(c)(15)"]);
excl("r-410a", ["(a)(7)", "(c)(8)", "(c)(14)"]);
excl("r-513a", ["(a)(1)", "(c)(1)", "(a)(10)(i)", "(c)(3)"]);
excl("r-32", ["(a)(1)", "(c)(1)", "(a)(10)(i)", "(c)(3)"]);
// non-regulated fluids must have 0 restrictions
for (const slug of ["r-22", "r-1234yf", "r-290", "r-744", "r-717"]) {
  const r = getRefrigerant(slug);
  if (r && isRegulated(r)) fail(`fixture: ${slug} must not be a regulated substance`);
}
// R-22 must have ODS milestones
{ const r = getRefrigerant("r-22"); if (r && ods(r).length === 0) fail("fixture: R-22 must have ODS milestones"); }

/* ─────────────────────────── 2. banner (floor 60) ───────────────────────── */

banner("verify-regulatory", refrigerants.length, 60, "refrigerants");

/* ─────────────────────────── 3. forbidden HTML patterns ─────────────────── */

const PATTERNS: { name: string; re: RegExp }[] = [
  { name: "SNAP-delist", re: /SNAP[^.]{0,40}delist/i },
  { name: "delisted", re: /delisted/i },
  { name: "most-new-commercial-refrigeration", re: /most new commercial refrigeration/i },
  { name: "ratified-Sep", re: /ratified Sep/i },
  { name: "EPA-AIM-Act", re: /EPA AIM Act/ },
  { name: "under-40-kW", re: /under 40 kW/i },
];

const BLOCK_TAGS = new Set(["p","div","section","article","li","td","th","tr","h1","h2","h3","h4","h5","h6","ul","ol","dl","dt","dd","header","footer","main","nav","details","summary","figcaption","blockquote","table","br"]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function blockText(node: any, out: string[]): void {
  if (!node) return;
  if (node.type === "text") { out.push(node.data ?? ""); return; }
  const name = typeof node.name === "string" ? node.name.toLowerCase() : "";
  if (name === "script" || name === "style") return;
  const block = BLOCK_TAGS.has(name);
  if (block) out.push("\n");
  for (const c of node.children ?? []) blockText(c, out);
  if (block) out.push("\n");
}
function searchable(html: string): string {
  const $ = cheerio.load(html);
  const parts: string[] = [$("title").text()];
  $('meta[name="description"]').each((_, el) => { parts.push($(el).attr("content") ?? ""); });
  $("script,style").remove();
  const body: string[] = [];
  blockText($("body")[0], body);
  parts.push(body.join(""));
  const $2 = cheerio.load(html);
  $2('script[type="application/ld+json"]').each((_, el) => { parts.push($2(el).text()); });
  return parts.join("\n");
}
function walk(dir: string, acc: string[]): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = path.relative(APP_DIR, full).split(path.sep).join("/");
    if (rel === "dev" || rel.startsWith("dev/")) continue;
    if (e.isDirectory()) walk(full, acc);
    else if (e.isFile() && e.name.endsWith(".html")) acc.push(full);
  }
  return acc;
}

const patternHits: { file: string; pattern: string; snippet: string }[] = [];
let scannedHtml = 0;
if (fs.existsSync(APP_DIR)) {
  for (const file of walk(APP_DIR, [])) {
    scannedHtml++;
    const text = searchable(fs.readFileSync(file, "utf8"));
    const rel = file.slice(ROOT.length + 1);
    for (const { name, re } of PATTERNS) {
      const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
      let m: RegExpExecArray | null;
      while ((m = g.exec(text)) !== null) {
        patternHits.push({ file: rel, pattern: name, snippet: text.slice(Math.max(0, m.index - 20), m.index + 60).replace(/\s+/g, " ").trim() });
        if (m.index === g.lastIndex) g.lastIndex++;
      }
    }
  }

  /* ── 4. regulated / ODS refrigerant pages must cite a regulatory source ── */
  const REG_MARKERS = [AIM_SOURCE_URL, "ecfr.gov", "7675", "84.54", "epa.gov/ods", "law.cornell.edu/cfr/text/40/84"];
  for (const r of refrigerants) {
    if (!r.indexable) continue;
    const klass = regulatoryClass(r);
    if (klass === "none") continue;
    const f = path.join(APP_DIR, "refrigerant", `${r.slug}.html`);
    if (!fs.existsSync(f)) continue;
    const html = fs.readFileSync(f, "utf8");
    const hasReg = REG_MARKERS.some((mk) => html.includes(mk));
    if (!hasReg) fail(`source: /refrigerant/${r.slug}/ (${klass}) has no regulatory source link/citation`);
  }
} else {
  fail(`.next/server/app not found at ${APP_DIR} — run after \`next build\``);
}

/* ─────────────────────────── report + exit ──────────────────────────────── */

console.log(`[verify-regulatory] scanned ${scannedHtml} HTML files; ${refrigerants.length} refrigerants evaluated`);
if (patternHits.length) {
  const counts: Record<string, number> = {};
  for (const h of patternHits) counts[h.pattern] = (counts[h.pattern] ?? 0) + 1;
  console.log("forbidden-pattern hits:");
  for (const [p, n] of Object.entries(counts)) console.log(`  ${n}\t${p}`);
  for (const h of patternHits.slice(0, 60)) console.log(`  [${h.pattern}] ${h.file}: ${h.snippet}`);
  for (const h of patternHits) fail(`pattern ${h.pattern} in ${h.file}: ${h.snippet}`);
}
if (failures.length) {
  console.error(`\n[verify-regulatory] FAIL — ${failures.length} issue(s):`);
  for (const m of failures.slice(0, 80)) console.error("  ✗ " + m);
  if (failures.length > 80) console.error(`  … and ${failures.length - 80} more`);
  process.exit(1);
}
console.log("[verify-regulatory] OK — fixtures match, no forbidden regulatory phrasing, regulatory sources present ✓");
process.exit(0);
