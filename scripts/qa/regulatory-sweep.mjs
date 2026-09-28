#!/usr/bin/env node
/**
 * Task 20 prose sweep. Scans page SOURCE (content/*.mdx + src/app|components|lib|data)
 * for every sentence containing a regulatory keyword and writes
 * scripts/qa/reports/regulatory-claims.csv with columns: route, sentence, keyword, action.
 *
 * "action" is auto-classified against Task 20 rules R1–R8 (a hint for review, not
 * an edit). Run again after fixes to confirm the residual set.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "scripts", "qa", "reports", "regulatory-claims.csv");

const KEYWORDS = [
  "SNAP", "delist", "F-Gas", "F-gas", "517/2014", "2024/573", "banned", "ban", "prohibit",
  "phase-out", "phased out", "phase-down", "Technology Transitions", "84.54", "Kigali",
  "Montreal", "AIM Act", "no longer permitted", "grandfather",
];

// keyword -> action hint (Task 20 rules)
function classify(sentence) {
  const s = sentence;
  if (/EPA AIM Act/.test(s)) return "R6: 'EPA AIM Act' -> 'AIM Act'";
  if (/ratified Sep/i.test(s)) return "R4: delete '(US ratified Sep 2022)'";
  if (/SNAP[^.]{0,40}delist|delist/i.test(s)) return "R2: delete SNAP delist claim (keep only FR-cited acceptability listing)";
  if (/most new commercial refrigeration/i.test(s)) return "R1: false blanket US ban -> engine (subsector+date+limit+para) or delete";
  if (/under 40 kW/i.test(s)) return "R3: wrong EU claim -> eu(ref) rows 11-13/Art13(3)";
  if (/517\/2014|F-Gas|F-gas|2024\/573/.test(s)) return "R3: EU claim = eu(ref) only; frame as 517/2014 replaced by 2024/573 (11 Mar 2024)";
  if (/Kigali/.test(s)) return "R4: Kigali only for HFC phase-down; counts from kigali block";
  if (/(CFC|R-11\b|R-12\b|R-502|R-503|R-115)/.test(s) && /(ban|banned|prohibit|phase-out|phased out)/i.test(s)) return "R5: 'US production/import of CFCs ended January 1, 1996 (EPA)'";
  if (/(ban|banned|prohibit|no longer permitted|phase-out|phased out)/i.test(s) && /(US|AIM Act|84\.54|new (equipment|commercial))/i.test(s)) return "R1: US ban must be engine-derived (subsector+date+limit+para) or deleted";
  if (/allowance|% of baseline|percent of baseline|baseline by/i.test(s)) return "R8: allowance schedule must match phasedown block (30%/20%/15%)";
  if (/Montreal/.test(s)) return "review: Montreal (CFC/HCFC ODS context)";
  if (/Technology Transitions|84\.54/.test(s)) return "verify: cite 40 CFR 84.54 (Technology Transitions) source";
  if (/phase-down/i.test(s)) return "verify: phase-down (AIM Act allowances / Kigali)";
  return "review";
}

function routeFor(file) {
  const rel = file.replace(ROOT + "/", "");
  let m;
  if ((m = rel.match(/^content\/refrigerants\/(.+)\.mdx$/))) return `/refrigerant/${m[1]}/`;
  if ((m = rel.match(/^content\/comparisons\/(.+)\.mdx$/))) return `/${m[1]}/`;
  if ((m = rel.match(/^content\/what-pressure\/(.+)\.mdx$/))) return `/what-pressure-should-${m[1]}/`;
  if ((m = rel.match(/^content\/guides\/(.+)\.mdx$/))) return `/${m[1]}/`;
  if ((m = rel.match(/^src\/app\/(.+)\/page\.tsx$/))) return `/${m[1]}/`;
  return rel; // components / lib / data — report the file path
}

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== "node_modules" && e.name !== ".next" && e.name !== "dev") walk(full, acc); }
    else if (/\.(mdx|tsx|ts)$/.test(e.name)) acc.push(full);
  }
  return acc;
}

const files = [
  ...walk(path.join(ROOT, "content"), []),
  ...walk(path.join(ROOT, "src", "app"), []),
  ...walk(path.join(ROOT, "src", "components"), []),
  ...walk(path.join(ROOT, "src", "lib"), []),
  ...walk(path.join(ROOT, "src", "data"), []),
];

const rows = [];
const seen = new Set();
for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const route = routeFor(file);
  // crude sentence split; keep it readable
  const sentences = text.split(/(?<=[.;:!?])\s+|\n/).map((s) => s.trim()).filter(Boolean);
  for (const raw of sentences) {
    const s = raw.replace(/\s+/g, " ").trim();
    if (s.length < 8 || s.length > 500) continue;
    const hit = KEYWORDS.find((k) => {
      const re = new RegExp(k === "ban" ? "\\bban\\b" : k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      return re.test(s);
    });
    if (!hit) continue;
    const key = route + "||" + s;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ route, sentence: s, keyword: hit, action: classify(s) });
  }
}

// CSV
const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
const header = "route,sentence,keyword,action";
const body = rows.map((r) => [r.route, r.sentence, r.keyword, r.action].map(esc).join(",")).join("\n");
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, header + "\n" + body + "\n", "utf8");

// summary to stdout
const byKw = {}, byAction = {};
for (const r of rows) { byKw[r.keyword] = (byKw[r.keyword] || 0) + 1; byAction[r.action] = (byAction[r.action] || 0) + 1; }
console.log(`[regulatory-sweep] ${rows.length} keyword sentences -> ${path.relative(ROOT, OUT)}`);
console.log("by keyword:");
for (const [k, n] of Object.entries(byKw).sort((a, b) => b[1] - a[1])) console.log(`  ${n}\t${k}`);
console.log("by action:");
for (const [a, n] of Object.entries(byAction).sort((a, b) => b[1] - a[1])) console.log(`  ${n}\t${a}`);
