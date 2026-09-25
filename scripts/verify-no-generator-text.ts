#!/usr/bin/env tsx
/**
 * Build gate (runs after next build, like verify-metadata): no developer /
 * generator-facing text may reach a rendered page. Uses cheerio over every
 * prerendered HTML file and checks visible text, <title>, meta description,
 * and JSON-LD string values.
 *
 * Any hit fails the build unless it is covered by an entry in
 * scripts/generator-text-allowlist.json (each entry needs a reason).
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, ".next", "server", "app");
const ALLOWLIST_FILE = path.join(ROOT, "scripts", "generator-text-allowlist.json");

// Case-sensitive banned patterns (task 5 PART 2 step 10).
const PATTERNS: { name: string; re: RegExp }[] = [
  { name: "Zod", re: /Zod/ },
  { name: "MDX", re: /\bMDX\b/ },
  { name: "frontmatter", re: /frontmatter/ },
  { name: "02-AUDIT", re: /02-AUDIT/ },
  { name: "project repo", re: /project repo/ },
  { name: "in this build", re: /in this build/ },
  { name: "slug", re: /\bslug\b/ },
  { name: "name-only", re: /name-only/ },
  { name: "Answer, in (one|two)", re: /Answer, in (one|two)/ },
  { name: "Page generated", re: /Page generated/ },
  { name: "[Rr]egenerated", re: /[Rr]egenerated/ },
  { name: "[Rr]ecords? generated", re: /[Rr]ecords? generated/ },
  { name: "Emitted as HowTo", re: /Emitted as HowTo/ },
  { name: "{r\\d(", re: /\{r\d\(/ },
  { name: "retrofitFeasible", re: /retrofitFeasible/ },
  { name: "code smell", re: /code smell/ },
  { name: "data generator", re: /data generator/ },
  { name: "peer-comparison group", re: /peer-comparison group/ },
  { name: "Pending source citation", re: /Pending source citation/ },
  { name: "neg twenty", re: /neg twenty/ },
  { name: "preserves a legacy URL", re: /preserves a legacy URL/ },
  { name: "paraphrases", re: /paraphrases/ },
  { name: "/api/refrigerants.json", re: /\/api\/refrigerants\.json/ },
  { name: "TODO", re: /TODO/ },
  { name: "FIXME", re: /FIXME/ },
  { name: "[Ll]orem ipsum", re: /[Ll]orem ipsum/ },
  { name: "NaN", re: /\bNaN\b/ },
  { name: "undefined", re: /\bundefined\b/ },
  { name: "[object Object]", re: /\[object Object\]/ },
  { name: "bare-citation-key", re: /\[[a-z][a-z0-9]{2,}\]/ },
  { name: "lowercase-type-label", re: /\b(hcfc|hfc|hfo|cfc|pfc)\b/ },
];

interface AllowEntry { pattern: string; contains: string; reason: string }
const allowlist: AllowEntry[] = fs.existsSync(ALLOWLIST_FILE)
  ? (JSON.parse(fs.readFileSync(ALLOWLIST_FILE, "utf8")) as AllowEntry[])
  : [];

function collectJsonLdStrings(node: unknown, out: string[]): void {
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) node.forEach((n) => collectJsonLdStrings(n, out));
  else if (node && typeof node === "object") Object.values(node).forEach((v) => collectJsonLdStrings(v, out));
}

/** Return the searchable strings for one HTML file. */
function searchable(html: string): string[] {
  const $ = cheerio.load(html);
  const out: string[] = [];
  out.push($("title").text());
  $('meta[name="description"]').each((_, el) => {
    out.push($(el).attr("content") ?? "");
  });
  $("script, style, template").remove();
  out.push($("body").text());
  // JSON-LD string values (parse before removal above? scripts removed — re-load)
  const $2 = cheerio.load(html);
  $2('script[type="application/ld+json"]').each((_, el) => {
    try {
      const strs: string[] = [];
      collectJsonLdStrings(JSON.parse($2(el).text()), strs);
      out.push(...strs);
    } catch { /* skip malformed */ }
  });
  return out;
}

function walkHtml(dir: string, acc: string[]): string[] {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walkHtml(full, acc);
    else if (name.endsWith(".html") && !full.includes(`${path.sep}dev${path.sep}`)) acc.push(full);
  }
  return acc;
}

function snippet(s: string, idx: number): string {
  const start = Math.max(0, idx - 20);
  return s.slice(start, start + 80).replace(/\s+/g, " ").trim();
}

if (!fs.existsSync(APP_DIR)) {
  console.error(`[verify-no-generator-text] ${APP_DIR} not found — run after next build.`);
  process.exit(1);
}

const files = walkHtml(APP_DIR, []);
const counts: Record<string, number> = {};
const failures: { pattern: string; file: string; snip: string }[] = [];

for (const file of files) {
  const rel = file.slice(ROOT.length + 1);
  const strings = searchable(fs.readFileSync(file, "utf8"));
  for (const { name, re } of PATTERNS) {
    const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    for (const s of strings) {
      let m: RegExpExecArray | null;
      while ((m = g.exec(s)) !== null) {
        const snip = snippet(s, m.index);
        const allowed = allowlist.some((a) => a.pattern === name && snip.includes(a.contains));
        counts[name] = (counts[name] ?? 0) + 1;
        if (!allowed) failures.push({ pattern: name, file: rel, snip });
        if (m.index === g.lastIndex) g.lastIndex++;
      }
    }
  }
}

console.log(`[verify-no-generator-text] scanned ${files.length} HTML files`);
const nonZero = Object.entries(counts).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
if (nonZero.length) {
  console.log("pattern hit counts (incl. allowlisted):");
  for (const [p, n] of nonZero) console.log(`  ${n}\t${p}`);
}
if (failures.length) {
  console.log(`\n${failures.length} DISALLOWED hit(s):`);
  const shown = failures.slice(0, 120);
  for (const f of shown) console.log(`  [${f.pattern}] ${f.file}: ${f.snip}`);
  if (failures.length > shown.length) console.log(`  … and ${failures.length - shown.length} more`);
  process.exit(1);
}
console.log("[verify-no-generator-text] no disallowed generator text ✓");
process.exit(0);
