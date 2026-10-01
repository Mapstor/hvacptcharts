#!/usr/bin/env tsx
/**
 * Build gate for the 9 rebuilt operating-pressure pages (Task 10).
 *
 * Runs post-`next build`. For each route, in the built HTML:
 *   - title ≤ 60 and meta description ≤ 155 (code points)
 *   - H1 matches the frontmatter h1 exactly
 *   - an answer block of 40–60 words containing <strong>
 *   - each by-outdoor chart has 11 rows at 65–115°F in 5°F steps (except R-744)
 *   - every table cell's data-psig equals the module output for its section
 *   - every psig figure in the page text is in the module's value set (or
 *     regulatory.json)
 *   - every kPa value is within ±4 of psig × 6.894757
 *   - no heading text matches /\d[A-Z][a-z]/  ("1Verify")
 *   - none of the banned legacy section strings appear
 *   - the ordered content-H2 lists are unique across the 9 pages
 *
 * All expected values come from src/lib/operating-page-data.ts fed by the
 * dataset — no hand-typed fixtures.
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { banner } from "./build-guard";
import { loadOperating } from "../src/lib/mdx-operating";
import { buildOperatingData, type RenderedSection } from "../src/lib/operating-page-data";
import { OUTDOOR_ROWS_F, PSI_TO_KPA } from "../src/data/operating-pressures";

const ROOT = process.cwd();
const APP_DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, ".next", "server", "app");

const IDS = ["410a", "r22", "r32", "r454b", "r407c", "r404a", "r449a", "r454c", "r744"];

const BANNED = [
  "Manufacturer and industry service literature",
  "Ranges are indicative",
  "Design-point view",
  "Operating envelope",
  "Saturation pressure ≠ operating pressure",
];

const failures: string[] = [];
const fail = (id: string, m: string) => failures.push(`[${id}] ${m}`);

/** Numbers that also legitimately appear via regulatory.json. */
function regulatoryNumbers(): Set<string> {
  const p = path.join(ROOT, "data", "reference", "regulatory.json");
  const set = new Set<string>();
  if (fs.existsSync(p)) {
    const txt = fs.readFileSync(p, "utf8");
    for (const m of txt.matchAll(/\d[\d,]*(?:\.\d+)?/g)) set.add(m[0].replace(/,/g, ""));
  }
  return set;
}
const REG_NUMS = regulatoryNumbers();

/** Split a psig range/value string into individual comma-free number tokens. */
function psigTokens(s: string): string[] {
  return s
    .replace(/,/g, "")
    .split(/[–—-]/)
    .map((t) => t.trim())
    .filter((t) => /^\d/.test(t));
}

/** Expected ordered data-psig list for a rendered section's table. */
function expectedPsig(sec: RenderedSection): string[] | null {
  if (sec.residentialChart) {
    const out: string[] = [];
    for (const r of sec.residentialChart.rows) out.push(sec.residentialChart.low.psigStr, r.band.psigStr);
    return out;
  }
  if (sec.headChart) return sec.headChart.rows.map((r) => r.band.psigStr);
  if (sec.applicationSuction) return [sec.applicationSuction.cooler.psigStr, sec.applicationSuction.freezer.psigStr];
  if (sec.standing) return sec.standing.rows.map((r) => r.psigStr);
  if (sec.comparisonAnchor) {
    const out: string[] = [];
    for (const r of sec.comparisonAnchor.rows) out.push(r.low.psigStr, r.high.psigStr);
    return out;
  }
  if (sec.comparisonChart) {
    const out: string[] = [];
    for (const r of sec.comparisonChart.rows) out.push(r.self.psigStr, r.other.psigStr);
    return out;
  }
  if (sec.co2Suction) return [sec.co2Suction.cooler.psigStr, sec.co2Suction.freezer.psigStr];
  if (sec.co2HighSide) return sec.co2HighSide.rows.map((r) => r.cell.psigStr);
  if (sec.co2Standstill) return sec.co2Standstill.rows.map((r) => r.cell.psigStr);
  return null;
}

const normalizedH2: Record<string, string> = {};

for (const id of IDS) {
  const file = path.join(APP_DIR, `what-pressure-should-${id}.html`);
  if (!fs.existsSync(file)) {
    fail(id, `built HTML not found: ${path.relative(ROOT, file)}`);
    continue;
  }
  const loaded = loadOperating(id);
  if (!loaded) {
    fail(id, "content file not an operating-layout file");
    continue;
  }
  const fm = loaded.frontmatter;
  const data = buildOperatingData(fm);
  const $ = cheerio.load(fs.readFileSync(file, "utf8"));

  // title ≤ 60, meta ≤ 155
  const title = $("title").first().text().trim();
  const meta = ($('meta[name="description"]').attr("content") ?? "").trim();
  if ([...title].length > 60) fail(id, `title ${[...title].length} > 60: ${title}`);
  if ([...meta].length > 155) fail(id, `meta ${[...meta].length} > 155`);

  // H1 exact
  const h1s = $("h1");
  if (h1s.length !== 1) fail(id, `expected 1 <h1>, found ${h1s.length}`);
  const h1 = h1s.first().text().trim();
  if (h1 !== fm.h1) fail(id, `H1 "${h1}" ≠ frontmatter "${fm.h1}"`);

  // answer block: 40–60 words, has <strong>
  const ab = $("[data-answer-block]");
  if (ab.length !== 1) fail(id, `expected 1 answer block, found ${ab.length}`);
  else {
    if (ab.find("strong").length === 0) fail(id, "answer block has no <strong>");
    const words = ab.text().replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
    if (words < 40 || words > 60) fail(id, `answer block ${words} words (need 40–60)`);
  }

  const article = $("article");

  // charts: 11 rows at 65–115°F (except R-744)
  if (id !== "r744") {
    article.find('table[data-op-table="chart"]').each((_, t) => {
      const rows = $(t).find("tbody tr");
      const kind = $(t).attr("data-op-section") ?? "?";
      if (rows.length !== OUTDOOR_ROWS_F.length) fail(id, `${kind} chart has ${rows.length} rows, expected ${OUTDOOR_ROWS_F.length}`);
      rows.each((i, tr) => {
        const first = $(tr).find("td").first().text();
        const m = first.match(/(-?\d+)\s*°F/);
        const got = m ? Number(m[1]) : NaN;
        if (got !== OUTDOOR_ROWS_F[i]) fail(id, `${kind} chart row ${i}: outdoor ${got}°F, expected ${OUTDOOR_ROWS_F[i]}°F`);
      });
    });
  }

  // per-section cell match via data-op-section
  for (const sec of data.sections) {
    const exp = expectedPsig(sec);
    if (!exp) continue;
    const table = article.find(`table[data-op-section="${sec.kind}"]`).first();
    if (table.length === 0) {
      fail(id, `no rendered table for section kind "${sec.kind}"`);
      continue;
    }
    const got = table.find("td[data-psig]").map((_, td) => $(td).attr("data-psig") ?? "").get();
    if (got.length !== exp.length) {
      fail(id, `${sec.kind}: ${got.length} data-psig cells, expected ${exp.length}`);
    } else {
      for (let i = 0; i < exp.length; i++) {
        if (got[i] !== exp[i]) fail(id, `${sec.kind} cell ${i}: data-psig "${got[i]}" ≠ module "${exp[i]}"`);
      }
    }
  }

  // kPa attribute check: data-kpa within ±4 of data-psig × 6.894757 (componentwise)
  article.find("td[data-psig][data-kpa]").each((_, td) => {
    const ps = psigTokens($(td).attr("data-psig") ?? "");
    const ks = psigTokens($(td).attr("data-kpa") ?? "");
    if (ps.length !== ks.length) return; // "—" cells etc.
    for (let i = 0; i < ps.length; i++) {
      const p = Number(ps[i]);
      const k = Number(ks[i]);
      if (Number.isFinite(p) && Number.isFinite(k) && Math.abs(k - p * PSI_TO_KPA) > 4) {
        fail(id, `kPa ${k} not within ±4 of ${p}×${PSI_TO_KPA} (=${Math.round(p * PSI_TO_KPA)})`);
      }
    }
  });

  // every psig figure in visible page text ∈ value set (or regulatory.json).
  // Normalize thousands separators on both sides ("1,018" ↔ "1018").
  $("script,style").remove();
  const vset = new Set([...data.valueSet].map((s) => s.replace(/,/g, "")));
  const bodyText = article.text().replace(/\s+/g, " ");
  for (const m of bodyText.matchAll(/(\d[\d.,]*(?:\s*[–—-]\s*\d[\d.,]*)?)\s*psig\b/gi)) {
    for (const tok of psigTokens(m[1])) {
      if (!vset.has(tok) && !REG_NUMS.has(tok)) {
        fail(id, `psig figure "${tok}" (in "${m[0].trim()}") not in module value set`);
      }
    }
  }

  // every kPa figure ≈ a page psig × 6.894757 (±4)
  const psigKpa = [...data.valueSet].map((s) => Math.round(Number(s.replace(/,/g, "")) * PSI_TO_KPA));
  for (const m of bodyText.matchAll(/(\d[\d.,]*(?:\s*[–—-]\s*\d[\d.,]*)?)\s*kPa/gi)) {
    for (const tok of psigTokens(m[1])) {
      const k = Number(tok);
      if (Number.isFinite(k) && !psigKpa.some((pk) => Math.abs(pk - k) <= 4)) {
        fail(id, `kPa figure "${tok}" has no matching psig×6.894757 on the page`);
      }
    }
  }

  // no heading runs a number into a word
  article.find("h1,h2,h3").each((_, h) => {
    const t = $(h).text();
    if (/\d[A-Z][a-z]/.test(t)) fail(id, `heading runs number into word: "${t}"`);
  });

  // no unfilled {slot} left in rendered text
  const slotLeft = article.text().match(/\{[a-z0-9_]+\}/i);
  if (slotLeft) fail(id, `unfilled slot left in rendered text: ${slotLeft[0]}`);

  // banned legacy strings
  const full = $.root().text();
  for (const b of BANNED) if (full.includes(b)) fail(id, `banned string present: "${b}"`);

  // collect content H2s (exclude the fixed FAQ/method/related headings)
  const fixed = new Set(["Frequently asked questions", "How these numbers are calculated", "Related"]);
  const h2s = article
    .find("h2")
    .map((_, h) => $(h).text().trim())
    .get()
    .filter((t) => !fixed.has(t));
  // strip refrigerant designations + CO₂ so only the section shape compares
  normalizedH2[id] = h2s
    .map((t) => t.replace(/R-?\d[0-9a-z]*/gi, "").replace(/\(?CO₂\)?/gi, "").replace(/\s+/g, " ").trim().toLowerCase())
    .join(" || ");
}

// H2 uniqueness across the 9 pages
const seen = new Map<string, string>();
for (const [id, key] of Object.entries(normalizedH2)) {
  const prev = seen.get(key);
  if (prev) fail(id, `content-H2 list not unique — same shape as ${prev}: "${key}"`);
  else seen.set(key, id);
}

banner("verify-operating-pages", IDS.length, 9, "operating pages");
if (failures.length) {
  console.error(`\n[verify-operating-pages] FAIL — ${failures.length} issue(s):`);
  for (const m of failures.slice(0, 80)) console.error("  ✗ " + m);
  if (failures.length > 80) console.error(`  … and ${failures.length - 80} more`);
  process.exit(1);
}
console.log("[verify-operating-pages] OK — 9 pages: titles/metas, H1, answer blocks, charts, cell values, psig/kPa, headings, H2 uniqueness ✓");
process.exit(0);
