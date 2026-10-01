#!/usr/bin/env node
/**
 * Full rendered-text export for the 9 operating-pressure pages (Task 10b).
 * Reads the BUILT HTML (.next/server/app/*.html) — not the content files — and
 * writes scripts/qa/reports/operating-pages-text.md. For each page, in page
 * order: every visible text block (headings, paragraphs, list items, table rows,
 * captions/source lines/footnotes, FAQ, method block), every internal link as
 * "anchor → href", and the visible "Updated" date plus the JSON-LD dateModified.
 * Run after `next build`.
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const ROOT = process.cwd();
const APP_DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, ".next", "server", "app");
const OUT = path.join(ROOT, "scripts", "qa", "reports", "operating-pages-text.md");
const IDS = ["410a", "r22", "r32", "r454b", "r407c", "r404a", "r449a", "r454c", "r744"];

const sq = (s) => (s || "").replace(/\s+/g, " ").trim();

const out = ["# Operating-pressure pages — full rendered-text export", "", "Extracted from the built HTML (.next/server/app). One section per page, in page order.", ""];

for (const id of IDS) {
  const file = path.join(APP_DIR, `what-pressure-should-${id}.html`);
  out.push(`## /what-pressure-should-${id}/`, "");
  if (!fs.existsSync(file)) { out.push(`_(built HTML not found)_`, "", "---", ""); continue; }
  const html = fs.readFileSync(file, "utf8");
  const $ = cheerio.load(html);

  // title + meta
  out.push(`- **<title>:** ${sq($("title").first().text())}`);
  out.push(`- **meta description:** ${sq($('meta[name="description"]').attr("content"))}`);

  // JSON-LD dateModified (Article)
  let dateModified = "(none)";
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const g = JSON.parse($(el).text());
      const nodes = Array.isArray(g["@graph"]) ? g["@graph"] : [g];
      for (const n of nodes) if (n && /Article/.test(n["@type"] || "") && n.dateModified) dateModified = n.dateModified;
    } catch { /* ignore */ }
  });
  out.push(`- **JSON-LD dateModified:** ${dateModified}`);

  const article = $("article").first();
  // visible "Updated" date
  const um = sq(article.text()).match(/Updated\s+[A-Z][a-z]+ \d{1,2}, \d{4}/);
  out.push(`- **visible Updated line:** ${um ? um[0] : "(none)"}`, "");

  // walk visible blocks in document order
  out.push("### Visible text (page order)", "");
  article.find("h1,h2,h3,p,li,figcaption,summary,table").each((_, el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === "table") {
      $(el).find("tr").each((_, tr) => {
        const cells = $(tr).find("th,td").map((_, c) => sq($(c).text())).get();
        if (cells.some(Boolean)) out.push(`| ${cells.join(" | ")} |`);
      });
      out.push("");
      return;
    }
    const t = sq($(el).text());
    if (!t) return;
    if (tag === "h1") out.push(`# ${t}`, "");
    else if (tag === "h2") out.push(`## ${t}`, "");
    else if (tag === "h3") out.push(`### ${t}`, "");
    else if (tag === "li") out.push(`- ${t}`);
    else if (tag === "figcaption") out.push(`_caption / source:_ ${t}`, "");
    else if (tag === "summary") out.push(`**FAQ Q:** ${t}`);
    else out.push(t, "");
  });

  // internal links
  out.push("", "### Internal links (anchor → href)", "");
  const seen = new Set();
  article.find("a[href^='/'], a[href^='http']").each((_, a) => {
    const href = $(a).attr("href");
    const text = sq($(a).text());
    const key = `${text}|${href}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(`- ${text || "(no text)"} → ${href}`);
  });

  out.push("", "---", "");
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out.join("\n") + "\n");
console.log(`[export-operating-text] wrote ${OUT} from built HTML (${IDS.length} pages)`);
