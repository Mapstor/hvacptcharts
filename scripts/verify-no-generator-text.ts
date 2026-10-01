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
import { banner, htmlFloor } from "./build-guard";

const ROOT = process.cwd();
// Scan dir defaults to the prerendered app output; an optional CLI arg overrides
// it (used to prove the gate FAILS when pointed at an empty directory).
const APP_DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, ".next", "server", "app");
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
  { name: "lowercase-type-label", re: /\b(hcfc|hfc|hfo|cfc|pfc|hcfo)\b/ },
  // Markdown that leaked as literal text because remark-gfm isn't enabled and a
  // table/link reached a page unrendered (task 6E). Both pipe-table delimiter
  // forms are banned in visible text.
  { name: "md-table-sep-spaced", re: /\| --- \|/ },
  { name: "md-table-sep-tight", re: /\|---\|/ },
  // Missing JSX whitespace: a refrigerant designation running straight into a
  // word ("R-404Apressures"), or a lowercase letter jammed against "(" then a
  // lowercase letter/digit ("glide(pure", "temperature(87"). Allowlist genuine
  // exceptions in generator-text-allowlist.json.
  { name: "refrigerant-run-into-word", re: /R-\d+[A-Z][a-z]/ },
  { name: "lowercase-open-paren", re: /[a-z]\([a-z0-9]/ },
  // Task 23 (G10): literal Markdown bold that leaked into rendered text, and any
  // visible number with 8+ decimal places (an unrounded computed ratio leaking
  // into an SVG/label, e.g. "0.001079215732364314").
  { name: "literal-markdown-bold", re: /\*\*/ },
  { name: "excessive-decimals", re: /\d\.\d{8,}/ },
  // Task 10: editorial / content-generation jargon that must never surface on a
  // rendered page. Genuine HVAC uses (e.g. "hook up gauges") are allowlisted in
  // generator-text-allowlist.json with a reason.
  { name: "hook", re: /\bhook\b/i },
  { name: "wedge", re: /\bwedge\b/i },
  { name: "archetype", re: /\barchetype\b/i },
  { name: "answer block", re: /answer block/i },
  { name: "ladder", re: /\bladder\b/i },
  { name: "information gain", re: /information gain/i },
  { name: "fan-out", re: /fan-out/i },
  { name: "single-sourced", re: /single-sourced/i },
  { name: "by construction", re: /by construction/i },
  { name: "calculation module", re: /calculation module/i },
  // Task 10b: more generator/editorial jargon. "anchor" (the reference-condition
  // sense), "saturation dataset", "typed-in". Genuine uses allowlisted.
  { name: "anchor", re: /\banchor\b/i },
  { name: "saturation dataset", re: /saturation dataset/i },
  { name: "typed-in", re: /typed-in/i },
];

// Looser run-together patterns (task 19 D3): a missing space after a sentence
// period ("chart range.The") or an alphanumeric token jammed against "(Word"
// ("CoolProp 7.2.0(Bell"). These fire on ordinary prose punctuation, so each
// match is passed through skipFalsePositive() to drop URLs, emails, code
// tokens, and file extensions before it counts. Allowlist genuine copy in
// generator-text-allowlist.json.
const LOOSE_PATTERNS: { name: string; re: RegExp }[] = [
  { name: "period-run-into-word", re: /[a-z]\.[A-Z][a-z]/ },
  { name: "alnum-open-paren-cap", re: /[0-9a-z]\([A-Z][a-z]/ },
];

// Return true when a loose-pattern hit sits inside a URL, email, code token, or
// file path — legitimate text where "." / "(" abut letters by construction.
function skipFalsePositive(s: string, idx: number): boolean {
  // Widen to the surrounding non-whitespace token.
  let start = idx;
  while (start > 0 && !/\s/.test(s[start - 1])) start--;
  let end = idx;
  while (end < s.length && !/\s/.test(s[end])) end++;
  const token = s.slice(start, end);
  if (/https?:\/\//.test(token)) return true;                 // URL
  if (/[\w.-]+@[\w.-]+/.test(token)) return true;             // email
  if (/\.(com|org|gov|net|edu|io|pdf|json|csv|tsx?|mjs|html)\b/i.test(token)) return true; // domain / file ext
  if (/^(e\.g|i\.e|etc|vs|al|no|fig|eq|cf|approx|in)\./i.test(token)) return true; // abbreviation (incl. in.Hg)
  if (/^doi:/i.test(token)) return true;                      // DOI
  if (/^[A-Za-z][A-Za-z0-9]*\([A-Za-z]/.test(token)) return true; // function notation, e.g. Ws(Twb), Pws(Tdp)
  return false;
}

interface AllowEntry { pattern: string; contains: string; reason: string }
const allowlist: AllowEntry[] = fs.existsSync(ALLOWLIST_FILE)
  ? (JSON.parse(fs.readFileSync(ALLOWLIST_FILE, "utf8")) as AllowEntry[])
  : [];

function collectJsonLdStrings(node: unknown, out: string[]): void {
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) node.forEach((n) => collectJsonLdStrings(n, out));
  else if (node && typeof node === "object") Object.values(node).forEach((v) => collectJsonLdStrings(v, out));
}

// Block-level tags render as a line/box break, so text across them never "runs
// together" visually. Inline tags (span, a, strong, sup…) do NOT separate their
// text — a missing space across an inline boundary IS a visible defect. We emit
// a newline at block boundaries and concatenate everything else with no
// separator, so the whitespace patterns fire on genuine run-togethers
// ("R-404Ato", "temperature(87") without tripping on element adjacency
// ("R-744" heading followed by a "Pair comparisons" heading).
const BLOCK_TAGS = new Set([
  "address", "article", "aside", "blockquote", "br", "caption", "dd", "details",
  "dialog", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form",
  "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "li", "main", "nav",
  "ol", "p", "pre", "section", "summary", "table", "tbody", "td", "tfoot", "th",
  "thead", "tr", "ul",
  // SVG <text> labels are independently-positioned; adjacent labels never run
  // together visually even though they concatenate in the DOM.
  "text",
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function blockAwareText(node: any, parts: string[]): void {
  if (!node) return;
  if (node.type === "text") { parts.push(node.data ?? ""); return; }
  const name = typeof node.name === "string" ? node.name.toLowerCase() : "";
  if (name === "script" || name === "style" || name === "template") return;
  const block = BLOCK_TAGS.has(name);
  if (block) parts.push("\n");
  for (const c of node.children ?? []) blockAwareText(c, parts);
  if (block) parts.push("\n");
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
  const bodyParts: string[] = [];
  blockAwareText($("body")[0], bodyParts);
  out.push(bodyParts.join(""));
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

/**
 * Recursively collect prerendered *.html under APP_DIR. Plain readdir walk with
 * `withFileTypes` and paths built by path.join(dir, entry.name) — no recursive
 * option, no globs, no Dirent.path / Dirent.parentPath (whose semantics differ
 * between Node 20 and 22). The dev-gallery route (.next/server/app/dev/**) is
 * skipped by its path RELATIVE to APP_DIR. The previous code tested the ABSOLUTE
 * path for "/dev/", which silently dropped every file when the checkout itself
 * lived under a directory named "dev" (e.g. ~/dev/hvacptcharts on a Mac) — the
 * "scanned 0 HTML files ✓" failure this gate now refuses to report.
 */
function walkHtml(dir: string, acc: string[]): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const relFromApp = path.relative(APP_DIR, full).split(path.sep).join("/");
    if (relFromApp === "dev" || relFromApp.startsWith("dev/")) continue; // dev gallery (noindex)
    if (entry.isDirectory()) walkHtml(full, acc);
    else if (entry.isFile() && entry.name.endsWith(".html")) acc.push(full);
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
banner("verify-no-generator-text", files.length, htmlFloor(), "HTML files");
console.log(`[verify-no-generator-text] scanned directory ${path.relative(ROOT, APP_DIR)}`);
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
  for (const { name, re } of LOOSE_PATTERNS) {
    const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    for (const s of strings) {
      let m: RegExpExecArray | null;
      while ((m = g.exec(s)) !== null) {
        if (!skipFalsePositive(s, m.index)) {
          const snip = snippet(s, m.index);
          const allowed = allowlist.some((a) => a.pattern === name && snip.includes(a.contains));
          counts[name] = (counts[name] ?? 0) + 1;
          if (!allowed) failures.push({ pattern: name, file: rel, snip });
        }
        if (m.index === g.lastIndex) g.lastIndex++;
      }
    }
  }
}

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
